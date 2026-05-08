import { db } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/crypto-secret";

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  /** Plain-text password — never persist to client. */
  password: string;
  fromAddress: string;
  fromName?: string;
  /** Public URL used to build links inside emails (invite, reset). */
  baseUrl?: string;
};

export type SmtpSettingsView = Omit<SmtpSettings, "password"> & {
  hasPassword: boolean;
};

const SMTP_KEY = "smtp";

type StoredSmtpPayload = Omit<SmtpSettings, "password"> & {
  passwordCipher: string;
};

function toView(settings: SmtpSettings): SmtpSettingsView {
  const { password, ...rest } = settings;
  return { ...rest, hasPassword: password.length > 0 };
}

export async function getSmtpSettings(): Promise<SmtpSettings | null> {
  const row = await db.setting.findUnique({ where: { key: SMTP_KEY } });
  if (!row) return null;
  let payload: StoredSmtpPayload;
  try {
    payload = JSON.parse(row.value) as StoredSmtpPayload;
  } catch {
    return null;
  }
  let password = "";
  if (payload.passwordCipher) {
    try {
      password = decryptSecret(payload.passwordCipher);
    } catch {
      // If decryption fails (e.g. NEXTAUTH_SECRET rotated), fall back to empty.
      password = "";
    }
  }
  return {
    host: payload.host,
    port: payload.port,
    secure: payload.secure,
    username: payload.username,
    password,
    fromAddress: payload.fromAddress,
    fromName: payload.fromName,
    baseUrl: payload.baseUrl,
  };
}

export async function getSmtpSettingsForView(): Promise<SmtpSettingsView | null> {
  const settings = await getSmtpSettings();
  return settings ? toView(settings) : null;
}

/**
 * Persist SMTP settings. If `password` is undefined, the existing stored
 * password is preserved (to support edits without re-typing the secret).
 */
export async function upsertSmtpSettings(input: {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromAddress: string;
  fromName?: string;
  baseUrl?: string;
}): Promise<SmtpSettingsView> {
  const existing = await getSmtpSettings();
  const password =
    typeof input.password === "string" ? input.password : existing?.password ?? "";

  const payload: StoredSmtpPayload = {
    host: input.host,
    port: input.port,
    secure: input.secure,
    username: input.username,
    fromAddress: input.fromAddress,
    fromName: input.fromName,
    baseUrl: input.baseUrl,
    passwordCipher: password ? encryptSecret(password) : "",
  };

  const value = JSON.stringify(payload);
  await db.setting.upsert({
    where: { key: SMTP_KEY },
    create: { key: SMTP_KEY, value },
    update: { value },
  });

  return toView({ ...payload, password });
}

export async function deleteSmtpSettings(): Promise<void> {
  await db.setting.deleteMany({ where: { key: SMTP_KEY } });
}
