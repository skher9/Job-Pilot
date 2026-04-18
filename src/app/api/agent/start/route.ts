import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Replace with session.user.id once auth is wired
const TEMP_USER_ID = "cltemp0000000000000000000";

export async function POST() {
  try {
    // Ensure temp user exists for dev
    await prisma.user.upsert({
      where: { id: TEMP_USER_ID },
      update: {},
      create: {
        id: TEMP_USER_ID,
        email: "dev@jobpilot.local",
        name: "Dev User",
      },
    });

    const run = await prisma.agentRun.create({
      data: {
        userId: TEMP_USER_ID,
        status: "running",
        logs: "[agent] Run started\n",
      },
    });

    // Kick off pipeline in background — don't await
    import("@/lib/agent/pipeline").then(({ runAgentPipeline }) => {
      runAgentPipeline(TEMP_USER_ID, run.id).catch(console.error);
    });

    return NextResponse.json({ runId: run.id, status: "running" });
  } catch (err) {
    console.error("[agent/start]", err);
    return NextResponse.json({ error: "Failed to start agent run" }, { status: 500 });
  }
}
