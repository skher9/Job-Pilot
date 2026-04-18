import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parseProfile } from "@/lib/config/yaml-parser";
import { scoreJob } from "@/lib/agent/scorer";

const TEMP_USER_ID = "cltemp0000000000000000000";

export async function POST(req: Request) {
  try {
    const { applicationId } = await req.json() as { applicationId: string };

    const [user, app] = await Promise.all([
      prisma.user.findUnique({ where: { id: TEMP_USER_ID }, select: { profileYaml: true } }),
      prisma.application.findUnique({ where: { id: applicationId } }),
    ]);

    if (!user?.profileYaml) return NextResponse.json({ error: "Profile not set" }, { status: 400 });
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const profile = parseProfile(user.profileYaml);
    const result = await scoreJob(app.jobTitle, app.jobDescription, profile);

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        fitScore: result.score,
        fitReasoning: result.reasoning,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        status: "scored",
      },
    });

    return NextResponse.json({ ...result, application: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
