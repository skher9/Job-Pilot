import { ApplicationTable } from "@/components/dashboard/ApplicationTable";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

export default async function ApplicationsPage() {
  const session = await auth();
  let apps: Awaited<ReturnType<typeof prisma.application.findMany>> = [];
  try {
    if (session?.user?.id) {
      apps = await prisma.application.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch {
    apps = [];
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Applications</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {apps.length} application{apps.length !== 1 ? "s" : ""} tracked.
        </p>
      </div>

      <ApplicationTable
        apps={apps.map((a: (typeof apps)[number]) => ({
          ...a,
          appliedAt: a.appliedAt?.toISOString() ?? null,
          createdAt: a.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
