import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return new Response("runId required", { status: 400 });
  }

  const encoder = new TextEncoder();
  let lastLogLength = 0;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
      };

      const poll = async () => {
        if (closed) return;

        try {
          const run = await prisma.agentRun.findUnique({
            where: { id: runId },
            select: { logs: true, status: true },
          });

          if (!run) {
            send("error", "Run not found");
            controller.close();
            return;
          }

          // Send any new log lines
          const newLogs = run.logs.slice(lastLogLength);
          if (newLogs) {
            const lines = newLogs.split("\n").filter(Boolean);
            for (const line of lines) {
              send("log", line);
            }
            lastLogLength = run.logs.length;
          }

          if (run.status !== "running") {
            send("done", run.status);
            controller.close();
            return;
          }

          setTimeout(poll, 1500);
        } catch {
          controller.close();
        }
      };

      await poll();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
