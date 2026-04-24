import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileYaml: true, configYaml: true },
    });
    return NextResponse.json({ profileYaml: user?.profileYaml, configYaml: user?.configYaml });
  } catch {
    return NextResponse.json({ profileYaml: null, configYaml: null });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as { profileYaml?: string; configYaml?: string };
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(body.profileYaml !== undefined ? { profileYaml: body.profileYaml } : {}),
        ...(body.configYaml !== undefined ? { configYaml: body.configYaml } : {}),
      },
    });
    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("[profile/POST]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
