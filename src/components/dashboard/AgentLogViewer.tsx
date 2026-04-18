'use client'

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LogLine {
  text: string;
  type: "info" | "error" | "success";
}

function parseLine(text: string): LogLine {
  if (text.includes("ERROR:") || text.includes("Error:")) return { text, type: "error" };
  if (text.includes("Done.") || text.includes("completed")) return { text, type: "success" };
  return { text, type: "info" };
}

export function AgentLogViewer({
  runId,
  initialLogs = "",
  live = false,
}: {
  runId?: string;
  initialLogs?: string;
  live?: boolean;
}) {
  const [lines, setLines] = useState<LogLine[]>(
    initialLogs
      .split("\n")
      .filter(Boolean)
      .map(parseLine)
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live || !runId) return;

    const es = new EventSource(`/api/agent/status?runId=${runId}`);
    es.addEventListener("log", (e) => {
      setLines((prev) => [...prev, parseLine(e.data as string)]);
    });
    es.addEventListener("done", () => {
      es.close();
    });
    es.onerror = () => es.close();

    return () => es.close();
  }, [live, runId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-xs">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-zinc-600">agent log</span>
        {live && (
          <span className="ml-auto flex items-center gap-1.5 text-emerald-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live
          </span>
        )}
      </div>
      <div className="h-72 overflow-y-auto p-3 space-y-0.5">
        {lines.length === 0 && (
          <p className="text-zinc-700 italic">No logs yet. Start an agent run.</p>
        )}
        {lines.map((line, i) => (
          <p
            key={i}
            className={cn(
              "leading-5 whitespace-pre-wrap break-all",
              line.type === "error" && "text-red-400",
              line.type === "success" && "text-emerald-400",
              line.type === "info" && "text-zinc-400"
            )}
          >
            {line.text}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
