'use client'

import { TrendingUp, Send, Clock, Calendar } from "lucide-react";

interface Stats {
  totalApplied: number;
  interviews: number;
  pendingReview: number;
  thisWeek: number;
}

const cards = [
  {
    key: "totalApplied" as keyof Stats,
    label: "Total Applied",
    icon: Send,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    key: "interviews" as keyof Stats,
    label: "Interviews",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "pendingReview" as keyof Stats,
    label: "Pending Review",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    key: "thisWeek" as keyof Stats,
    label: "This Week",
    icon: Calendar,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
            <div className={`${bg} rounded-md p-1.5`}>
              <Icon size={14} className={color} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold text-white tabular-nums">
            {stats[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
