import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { canManageSettings } from "@/lib/permissions";
import { isSmtpConfigured, sendMail } from "@/lib/mailer";
import { smtpTestSchema } from "@/lib/validation/settings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const actor = await requireRole("admin");
  if (actor instanceof NextResponse) return actor;
  if (!canManageSettings(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const payload = await request.json().catch(() => null);
  const parsed = smtpTestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (!(await isSmtpConfigured())) {
    return NextResponse.json(
      { error: "SMTP is not configured." },
      { status: 400 },
    );
  }

  const result = await sendMail({
    to: parsed.data.to,
    subject: "SMTP test from Kechimyaku",
    text:
      "This is a test message confirming that SMTP delivery is working from Kechimyaku.",
    html:
      "<p>This is a test message confirming that SMTP delivery is working from <strong>Kechimyaku</strong>.</p>",
  });

  if (!result.delivered) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "reason" in result && result.reason === "send-failed"
            ? result.error
            : "Failed to deliver test email.",
      },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, messageId: result.messageId });
}
