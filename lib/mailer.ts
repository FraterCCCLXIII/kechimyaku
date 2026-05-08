import nodemailer, { type Transporter } from "nodemailer";
import { getSmtpSettings, type SmtpSettings } from "@/lib/settings";

export type SendResult =
  | { delivered: true; messageId?: string }
  | { delivered: false; reason: "smtp-not-configured" }
  | { delivered: false; reason: "send-failed"; error: string };

function buildFromHeader(settings: SmtpSettings): string {
  return settings.fromName
    ? `"${settings.fromName}" <${settings.fromAddress}>`
    : settings.fromAddress;
}

function buildTransport(settings: SmtpSettings): Transporter {
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth:
      settings.username || settings.password
        ? { user: settings.username, pass: settings.password }
        : undefined,
  });
}

export async function isSmtpConfigured(): Promise<boolean> {
  const s = await getSmtpSettings();
  return Boolean(s && s.host && s.fromAddress);
}

export async function verifySmtpConnection(
  override?: SmtpSettings,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const settings = override ?? (await getSmtpSettings());
  if (!settings) return { ok: false, error: "SMTP is not configured." };
  try {
    await buildTransport(settings).verify();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown SMTP error.",
    };
  }
}

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<SendResult> {
  const settings = await getSmtpSettings();
  if (!settings || !settings.host || !settings.fromAddress) {
    return { delivered: false, reason: "smtp-not-configured" };
  }
  try {
    const info = await buildTransport(settings).sendMail({
      from: buildFromHeader(settings),
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { delivered: true, messageId: info.messageId };
  } catch (error) {
    return {
      delivered: false,
      reason: "send-failed",
      error: error instanceof Error ? error.message : "Unknown send error.",
    };
  }
}

/** Resolve the public base URL used to build action links inside emails. */
export async function resolveBaseUrl(
  request?: Request,
): Promise<string> {
  const settings = await getSmtpSettings();
  if (settings?.baseUrl) return settings.baseUrl.replace(/\/+$/, "");
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/+$/, "");
  }
  if (request) {
    try {
      const url = new URL(request.url);
      return `${url.protocol}//${url.host}`;
    } catch {
      // fall through
    }
  }
  return "http://localhost:3000";
}
