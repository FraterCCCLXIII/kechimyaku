import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { canManageSettings } from "@/lib/permissions";
import {
  getSmtpSettingsForView,
  upsertSmtpSettings,
} from "@/lib/settings";
import { smtpSettingsSchema } from "@/lib/validation/settings";

export const runtime = "nodejs";

export async function GET() {
  const actor = await requireRole("admin");
  if (actor instanceof NextResponse) return actor;
  if (!canManageSettings(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const view = await getSmtpSettingsForView();
  return NextResponse.json({ smtp: view });
}

export async function PUT(request: Request) {
  const actor = await requireRole("admin");
  if (actor instanceof NextResponse) return actor;
  if (!canManageSettings(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const payload = await request.json().catch(() => null);
  const parsed = smtpSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const view = await upsertSmtpSettings({
    host: parsed.data.host,
    port: parsed.data.port,
    secure: parsed.data.secure,
    username: parsed.data.username,
    password:
      typeof parsed.data.password === "string" && parsed.data.password.length > 0
        ? parsed.data.password
        : undefined,
    fromAddress: parsed.data.fromAddress,
    fromName: parsed.data.fromName || undefined,
    baseUrl: parsed.data.baseUrl || undefined,
  });
  return NextResponse.json({ smtp: view });
}
