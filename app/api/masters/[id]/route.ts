import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const masterId = Number.parseInt(id, 10);

  if (!Number.isInteger(masterId)) {
    return NextResponse.json({ error: "Invalid master id" }, { status: 400 });
  }

  const master = await db.master.findUnique({
    where: { id: masterId },
    include: {
      wikiEntry: true,
      childLinks: {
        include: {
          childMaster: true,
          relationshipType: true,
        },
      },
      parentLinks: {
        include: {
          parentMaster: true,
          relationshipType: true,
        },
      },
    },
  });

  if (!master) {
    return NextResponse.json({ error: "Master not found" }, { status: 404 });
  }

  return NextResponse.json(master);
}
