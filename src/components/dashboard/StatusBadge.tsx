import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  discovered: "bg-zinc-700/50 text-zinc-400 border-zinc-700",
  scored: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  tailored: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  ready: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  applied: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  interviewing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.discovered;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        style
      )}
    >
      {status}
    </span>
  );
}
