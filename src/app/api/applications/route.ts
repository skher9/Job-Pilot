import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const TEMP_USER_ID = "cltemp0000000000000000000";

export async function GET() {
  try {
    const apps = await prisma.application.findMany({
      where: { userId: TEMP_USER_ID },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ applications: apps });
  } catch (err) {
    console.error("[applications/GET]", err);
    return NextResponse.json({ applications: [] });
  }
}
