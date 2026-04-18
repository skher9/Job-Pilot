import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parseConfig } from "@/lib/config/yaml-parser";
import { scrapeLinkedIn } from "@/lib/agent/scraper";

const TEMP_USER_ID = "cltemp0000000000000000000";

export async function POST() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: TEMP_USER_ID },
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
