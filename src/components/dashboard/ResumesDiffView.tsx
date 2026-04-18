'use client'

import { useMemo, useState } from "react";
import { diffLines } from "diff";
import { cn } from "@/lib/utils";

interface Props {
  original: string;
  tailored: string;
}

export function ResumesDiffView({ original, tailored }: Props) {
  const [view, setView] = useState<"diff" | "side">("diff");

  const diffResult = useMemo(
    () => diffLines(original, tailored),
    [original, tailored]
  );

  const added = diffResult.filter((p) => p.added).reduce((n, p) => n + (p.count ?? 0), 0);
  const removed = diffResult.filter((p) => p.removed).reduce((n, p) => n + (p.count ?? 0), 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-xs text-emerald-400">+{added} lines</span>
        <span className="text-xs text-red-400">-{removed} lines</span>
        <div className="ml-auto flex rounded-md border border-zinc-700 overflow-hidden">
          {(["diff", "side"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1 text-xs",
                view === v ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {v === "diff" ? "Unified" : "Side by side"}
            </button>
          ))}
        </div>
      </div>

      {view === "diff" ? (
        <div className="rounded-md border border-zinc-700 bg-zinc-900 font-mono text-xs overflow-auto max-h-64">
          {diffResult.map((part, i) => (
            <div
              key={i}
              className={cn(
                "px-4 py-0.5 whitespace-pre-wrap leading-5",
                part.added && "bg-emerald-500/10 text-emerald-300",
                part.removed && "bg-red-500/10 text-red-300 line-through opacity-70",
                !part.added && !part.removed && "text-zinc-500"
              )}
            >
              <span className="select-none mr-2 opacity-50">
                {part.added ? "+" : part.removed ? "−" : " "}
              </span>
              {part.value}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {(["original", "tailored"] as const).map((side) => (
            <div key={side} className="rounded-md border border-zinc-700 bg-zinc-900">
              <div className="px-3 py-2 border-b border-zinc-700 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {side}
              </div>
              <pre className="p-3 text-xs text-zinc-400 font-mono overflow-auto max-h-56 whitespace-pre-wrap leading-5">
                {side === "original" ? original : tailored}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
