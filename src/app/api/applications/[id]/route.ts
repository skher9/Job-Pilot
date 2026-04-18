import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json() as { status?: string };

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.status === "applied" ? { appliedAt: new Date() } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[applications/PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await prisma.application.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[applications/DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
