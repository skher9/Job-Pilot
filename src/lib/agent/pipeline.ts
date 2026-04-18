import { prisma } from "@/lib/db/prisma";
import { parseProfile, parseConfig } from "@/lib/config/yaml-parser";
import { scrapeLinkedIn, fetchJobDescription } from "./scraper";
import { scoreJob } from "./scorer";
import { tailorResume } from "./tailorer";
import { generateCoverLetter } from "./cover-letter";
import { dumpProfile } from "@/lib/config/yaml-parser";

export async function runAgentPipeline(
  userId: string,
  agentRunId: string
): Promise<void> {
  const appendLog = async (msg: string) => {
    const timestamp = new Date().toISOString().slice(11, 19);
    const line = `[${timestamp}] ${msg}\n`;
    await prisma.agentRun.update({
      where: { id: agentRunId },
      data: { logs: { set: undefined } },
    });
    // Append to logs using raw SQL for efficiency
    await prisma.$executeRaw`
      UPDATE "AgentRun" SET logs = logs || ${line} WHERE id = ${agentRunId}
    `;
  };

  const fail = async (msg: string) => {
    await appendLog(`ERROR: ${msg}`);
    await prisma.agentRun.update({
      where: { id: agentRunId },
      data: { status: "failed", endedAt: new Date() },
    });
  };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.profileYaml || !user?.configYaml) {
      await fail("Profile or config YAML missing. Set up your profile first.");
      return;
    }

    const profile = parseProfile(user.profileYaml);
    const config = parseConfig(user.configYaml);

    await appendLog("Stage 1: Scraping jobs...");

    const jobs = await scrapeLinkedIn(config, (msg) => appendLog(msg));
    await appendLog(`Found ${jobs.length} jobs after filtering.`);
    await prisma.agentRun.update({
      where: { id: agentRunId },
      data: { jobsFound: jobs.length },
    });

    if (jobs.length === 0) {
      await appendLog("No jobs found. Try different keywords or locations.");
      await prisma.agentRun.update({
        where: { id: agentRunId },
        data: { status: "completed", endedAt: new Date() },
      });
      return;
    }

    await appendLog("Stage 2: Scoring jobs...");
    const maxApps = config.application.max_applications_per_run;
    let processed = 0;

    for (const job of jobs) {
      if (processed >= maxApps) break;

      // check if we've already seen this job
      const existing = await prisma.application.findFirst({
        where: { userId, jobUrl: job.url },
      });
      if (existing) continue;

      await appendLog(`Scoring: ${job.title} at ${job.company}`);

      // fetch full description if empty
      let description = job.description;
      if (!description && job.url) {
        try {
          description = await fetchJobDescription(job.url);
        } catch {
          description = "";
        }
      }

      const app = await prisma.application.create({
        data: {
          userId,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          platform: job.platform,
          jobUrl: job.url,
          jobDescription: description,
          status: "discovered",
        },
      });

      const scoreResult = await scoreJob(job.title, description, profile);
      await appendLog(
        `  Score: ${scoreResult.score}/10 — ${scoreResult.reasoning.slice(0, 80)}...`
      );

      await prisma.application.update({
        where: { id: app.id },
        data: {
          fitScore: scoreResult.score,
          fitReasoning: scoreResult.reasoning,
          matchedSkills: scoreResult.matchedSkills,
          missingSkills: scoreResult.missingSkills,
          status: "scored",
        },
      });

      if (scoreResult.score < config.application.min_fit_score) {
        await appendLog(`  Skipping (score below threshold ${config.application.min_fit_score})`);
        continue;
      }

      // Stage 3: Tailor resume
      if (config.application.tailor_resume) {
        await appendLog(`  Tailoring resume for ${job.title}...`);
        const aggressiveness = config.ai?.resume_aggressiveness ?? "moderate";
        const tailored = await tailorResume(profile, job.title, description, aggressiveness);
        const tailoredYaml = dumpProfile(tailored);

        await prisma.application.update({
          where: { id: app.id },
          data: {
            originalResume: user.profileYaml,
            tailoredResume: tailoredYaml,
            status: "tailored",
          },
        });
      }

      // Stage 4: Cover letter
      if (config.application.cover_letter) {
        await appendLog(`  Generating cover letter...`);
        const letter = await generateCoverLetter(profile, job.title, job.company, description);
        await prisma.application.update({
          where: { id: app.id },
          data: { coverLetter: letter, status: "ready" },
        });
      }

      processed++;
    }

    await appendLog(`Done. Prepared ${processed} applications.`);
    await prisma.agentRun.update({
      where: { id: agentRunId },
      data: { status: "completed", endedAt: new Date(), jobsApplied: processed },
    });
  } catch (err) {
    await fail(String(err));
  }
}
