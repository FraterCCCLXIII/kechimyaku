import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth-guard";
import { masterInputSchema } from "@/lib/validation/masters";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const masters = await db.master.findMany({
    include: {
      parentLinks: {
        include: {
          parentMaster: true,
          relationshipType: true,
        },
      },
      childLinks: {
        include: {
          childMaster: true,
          relationshipType: true,
        },
      },
      wikiEntry: true,
    },
    orderBy: [{ name: "asc" }],
  });
  return NextResponse.json(masters);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const payload = await request.json();
  const parsed = masterInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { parentMasterId, relationshipTypeId, ...masterData } = parsed.data;
  const master = await db.master.create({
    data: {
      ...masterData,
      isRoot: masterData.isRoot ?? false,
    },
  });

  if (Number.isInteger(parentMasterId)) {
    await db.relationship.create({
      data: {
        parentMasterId: parentMasterId as number,
        childMasterId: master.id,
        relationshipTypeId: relationshipTypeId ?? null,
      },
    });
  }

  return NextResponse.json(master, { status: 201 });
}
