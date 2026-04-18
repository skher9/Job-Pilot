import { cn } from "@/lib/utils";

export function FitScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-zinc-600 text-xs">—</span>;

  const color =
    score >= 8
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : score >= 6
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-red-500/15 text-red-400 border-red-500/30";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums",
        color
      )}
    >
      {score}/10
    </span>
  );
}
