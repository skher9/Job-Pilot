'use client'

import { useState } from "react";
import { AgentLogViewer } from "@/components/dashboard/AgentLogViewer";
import { Play, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RunStatus = "idle" | "running" | "completed" | "failed" | "stopped";

const STAGE_LABELS = ["Scraping", "Scoring", "Tailoring", "Cover Letters"];

export default function AgentPage() {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [runId, setRunId] = useState<string | null>(null);
  const [jobsFound, setJobsFound] = useState(0);
  const [jobsPrepared, setJobsPrepared] = useState(0);

  const start = async () => {
    setStatus("running");
    setJobsFound(0);
    setJobsPrepared(0);
    try {
      const res = await fetch("/api/agent/start", { method: "POST" });
      const data = await res.json() as { runId?: string };
      if (data.runId) setRunId(data.runId);
    } catch {
      setStatus("failed");
    }
  };

  const stop = async () => {
    if (!runId) return;
    await fetch("/api/agent/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId }),
    });
    setStatus("stopped");
  };

  const currentStage = status === "running" ? 0 : -1;

  return (
    <div className="px-6 py-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Agent</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Start a run to scrape jobs, score fit, and prepare application materials.
        </p>
      </div>

      {/* Control panel */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-5">
        <div className="flex items-center gap-4">
          {status === "running" ? (
            <button
              onClick={stop}
              className="flex items-center gap-2 rounded-md bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors"
            >
              <Square size={14} />
              Stop
            </button>
          ) : (
            <button
              onClick={start}
              className="flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {status === "idle" ? (
                <><Play size={14} /> Start Run</>
              ) : (
                <><Loader2 size={14} className="animate-spin" /> Starting...</>
              )}
            </button>
          )}

          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-block w-2 h-2 rounded-full",
                status === "running" && "bg-emerald-400 animate-pulse",
                status === "idle" && "bg-zinc-600",
                status === "completed" && "bg-emerald-400",
                status === "failed" && "bg-red-400",
                status === "stopped" && "bg-amber-400"
              )}
            />
            <span className="text-sm text-zinc-400 capitalize">{status}</span>
          </div>

          {(jobsFound > 0 || jobsPrepared > 0) && (
            <div className="ml-auto flex gap-4 text-xs text-zinc-500">
              <span><span className="text-white font-medium">{jobsFound}</span> found</span>
              <span><span className="text-white font-medium">{jobsPrepared}</span> prepared</span>
            </div>
          )}
        </div>

        {/* Stage progress */}
        {status === "running" && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-600 uppercase tracking-wider">Pipeline</p>
            <div className="flex gap-2">
              {STAGE_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-1 w-16 rounded-full transition-all",
                      i < currentStage
                        ? "bg-emerald-500"
                        : i === currentStage
                        ? "bg-indigo-500 animate-pulse"
                        : "bg-zinc-800"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      i === currentStage ? "text-zinc-200" : "text-zinc-600"
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log viewer */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Run Log</p>
        <AgentLogViewer
          runId={runId ?? undefined}
          live={status === "running"}
        />
      </div>

      {/* Recent runs */}
      <RecentRuns />
    </div>
  );
}

function RecentRuns() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Recent Runs</p>
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500">Jobs Found</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500">Prepared</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500">Started</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-zinc-600 text-xs">
                No runs yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
