import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const TEMP_USER_ID = "cltemp0000000000000000000";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: TEMP_USER_ID },
      select: { profileYaml: true, configYaml: true },
    });
    return NextResponse.json({ profileYaml: user?.profileYaml, configYaml: user?.configYaml });
  } catch {
    return NextResponse.json({ profileYaml: null, configYaml: null });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { profileYaml?: string; configYaml?: string };

    await prisma.user.upsert({
      where: { id: TEMP_USER_ID },
      update: {
        ...(body.profileYaml !== undefined ? { profileYaml: body.profileYaml } : {}),
        ...(body.configYaml !== undefined ? { configYaml: body.configYaml } : {}),
      },
      create: {
        id: TEMP_USER_ID,
        email: "dev@jobpilot.local",
        name: "Dev User",
        profileYaml: body.profileYaml,
        configYaml: body.configYaml,
      },
    });

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("[profile/POST]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
