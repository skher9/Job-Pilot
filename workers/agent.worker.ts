import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { runAgentPipeline } from "../src/lib/agent/pipeline";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

interface AgentJobData {
  userId: string;
  agentRunId: string;
}

const worker = new Worker<AgentJobData>(
  "agent-runs",
  async (job: Job<AgentJobData>) => {
    const { userId, agentRunId } = job.data;
    console.log(`[worker] Processing run ${agentRunId} for user ${userId}`);
    await runAgentPipeline(userId, agentRunId);
    console.log(`[worker] Run ${agentRunId} complete`);
  },
  {
    connection,
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err);
});

console.log("[worker] Agent worker started. Listening for jobs...");
