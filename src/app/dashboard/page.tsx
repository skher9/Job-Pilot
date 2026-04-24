import { StatsCards } from "@/components/dashboard/StatsCards";
import { ApplicationTable } from "@/components/dashboard/ApplicationTable";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

async function getPageData(userId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  type App = Awaited<ReturnType<typeof prisma.application.findMany>>[number];

  const [all, recent] = await Promise.all([
    prisma.application.findMany({ where: { userId } }),
    prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    stats: {
      totalApplied: all.filter((a: App) => a.status === "applied").length,
      interviews: all.filter((a: App) => a.status === "interviewing").length,
      pendingReview: all.filter((a: App) => a.status === "ready").length,
      thisWeek: all.filter((a: App) => a.createdAt > weekAgo).length,
    },
    recent,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  let data = {
    stats: { totalApplied: 0, interviews: 0, pendingReview: 0, thisWeek: 0 },
    recent: [] as Awaited<ReturnType<typeof prisma.application.findMany>>,
  };

  try {
    if (session?.user?.id) data = await getPageData(session.user.id);
  } catch {
    // show empty state
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Overview</h1>
          <p className="mt-1 text-sm text-zinc-500">Your job search at a glance.</p>
        </div>
        <Link
          href="/dashboard/agent"
          className="flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <Bot size={15} />
          Start Run
          <ArrowRight size={14} />
        </Link>
      </div>

      <StatsCards stats={data.stats} />

      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Recent Applications</h2>
        <ApplicationTable
          apps={data.recent.map((a: (typeof data.recent)[number]) => ({
            ...a,
            appliedAt: a.appliedAt?.toISOString() ?? null,
            createdAt: a.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
