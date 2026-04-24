import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const run = await prisma.agentRun.create({
      data: {
        userId: session.user.id,
        status: "running",
        logs: "[agent] Run started\n",
      },
    });

    import("@/lib/agent/pipeline").then(({ runAgentPipeline }) => {
      runAgentPipeline(session.user.id, run.id).catch(console.error);
    });

    return NextResponse.json({ runId: run.id, status: "running" });
  } catch (err) {
    console.error("[agent/start]", err);
    return NextResponse.json({ error: "Failed to start agent run" }, { status: 500 });
  }
}
