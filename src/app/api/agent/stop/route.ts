import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { runId } = await req.json() as { runId: string };

    const run = await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: "stopped",
        endedAt: new Date(),
        logs: { set: undefined },
      },
    });

    // Append stopped message
    await prisma.$executeRaw`
      UPDATE "AgentRun" SET logs = logs || '[agent] Run stopped by user\n' WHERE id = ${runId}
    `;

    return NextResponse.json({ status: run.status });
  } catch (err) {
    console.error("[agent/stop]", err);
    return NextResponse.json({ error: "Failed to stop run" }, { status: 500 });
  }
}
