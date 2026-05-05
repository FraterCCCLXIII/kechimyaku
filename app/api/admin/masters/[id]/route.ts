import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth-guard";
import { masterInputSchema } from "@/lib/validation/masters";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const parseId = async (context: RouteContext) => {
  const { id } = await context.params;
  const masterId = Number.parseInt(id, 10);
  return Number.isInteger(masterId) ? masterId : null;
};

export async function GET(_: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const masterId = await parseId(context);
  if (!masterId) {
    return NextResponse.json({ error: "Invalid master id" }, { status: 400 });
  }

  const master = await db.master.findUnique({
    where: { id: masterId },
    include: {
      wikiEntry: true,
      parentLinks: true,
    },
  });
  if (!master) {
    return NextResponse.json({ error: "Master not found" }, { status: 404 });
  }

  return NextResponse.json(master);
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const masterId = await parseId(context);
  if (!masterId) {
    return NextResponse.json({ error: "Invalid master id" }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = masterInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { parentMasterId, relationshipTypeId, ...masterData } = parsed.data;
  const updated = await db.master.update({
    where: { id: masterId },
    data: masterData,
  });

  await db.relationship.deleteMany({
    where: { childMasterId: masterId },
  });

  if (Number.isInteger(parentMasterId)) {
    await db.relationship.create({
      data: {
        parentMasterId: parentMasterId as number,
        childMasterId: masterId,
        relationshipTypeId: relationshipTypeId ?? null,
      },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const masterId = await parseId(context);
  if (!masterId) {
    return NextResponse.json({ error: "Invalid master id" }, { status: 400 });
  }

  await db.relationship.deleteMany({
    where: {
      OR: [{ parentMasterId: masterId }, { childMasterId: masterId }],
    },
  });
  await db.master.delete({ where: { id: masterId } });

  return NextResponse.json({ ok: true });
}
