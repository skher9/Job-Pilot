import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { parseConfig } from "@/lib/config/yaml-parser";
import { scrapeLinkedIn } from "@/lib/agent/scraper";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { configYaml: true },
    });

    if (!user?.configYaml) {
      return NextResponse.json({ error: "Config YAML not set" }, { status: 400 });
    }

    const config = parseConfig(user.configYaml);
    const logs: string[] = [];
    const jobs = await scrapeLinkedIn(config, (msg) => logs.push(msg));

    return NextResponse.json({ jobs, count: jobs.length, logs });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
