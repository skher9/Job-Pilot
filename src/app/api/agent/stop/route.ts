import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { runId } = await req.json() as { runId: string };

    const run = await prisma.agentRun.findUnique({ where: { id: runId }, select: { userId: true, logs: true } });
    if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
    if (run.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: "stopped",
        endedAt: new Date(),
        logs: run.logs + "[agent] Run stopped by user\n",
      },
    });

    return NextResponse.json({ status: "stopped" });
  } catch (err) {
    console.error("[agent/stop]", err);
    return NextResponse.json({ error: "Failed to stop run" }, { status: 500 });
  }
}
