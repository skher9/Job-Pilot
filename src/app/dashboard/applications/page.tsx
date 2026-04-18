import { ApplicationTable } from "@/components/dashboard/ApplicationTable";
import { prisma } from "@/lib/db/prisma";

const TEMP_USER_ID = "cltemp0000000000000000000";

export default async function ApplicationsPage() {
  let apps: Awaited<ReturnType<typeof prisma.application.findMany>> = [];
  try {
    apps = await prisma.application.findMany({
      where: { userId: TEMP_USER_ID },
      orderBy: { createdAt: "desc" },
    });
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
        apps={apps.map((a) => ({
          ...a,
          appliedAt: a.appliedAt?.toISOString() ?? null,
          createdAt: a.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
