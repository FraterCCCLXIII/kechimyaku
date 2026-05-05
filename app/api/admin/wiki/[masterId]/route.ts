import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth-guard";
import { wikiInputSchema } from "@/lib/validation/masters";

type RouteContext = {
  params: Promise<{ masterId: string }>;
};

const parseMasterId = async (context: RouteContext) => {
  const { masterId } = await context.params;
  const id = Number.parseInt(masterId, 10);
  return Number.isInteger(id) ? id : null;
};

export async function GET(_: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const masterId = await parseMasterId(context);
  if (!masterId) {
    return NextResponse.json({ error: "Invalid master id" }, { status: 400 });
  }

  const entry = await db.wikiEntry.findUnique({
    where: { masterId },
  });
  return NextResponse.json(entry ?? { masterId, content: "" });
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const masterId = await parseMasterId(context);
  if (!masterId) {
    return NextResponse.json({ error: "Invalid master id" }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = wikiInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await db.wikiEntry.upsert({
    where: { masterId },
    create: {
      masterId,
      content: parsed.data.content,
    },
    update: {
      content: parsed.data.content,
    },
  });

  return NextResponse.json(entry);
}
