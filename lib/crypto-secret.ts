import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

/**
 * Symmetric encryption for at-rest secrets (e.g. SMTP password).
 *
 * The encryption key is derived from `NEXTAUTH_SECRET` (or `APP_SECRET`)
 * via SHA-256, giving a deterministic 32-byte key without storing one.
 * Output is encoded as `v1:<iv-base64>:<authTag-base64>:<ciphertext-base64>`
 * so we can rotate the algorithm later by checking the prefix.
 */
const PREFIX = "v1:";

function getKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.APP_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error(
      "NEXTAUTH_SECRET (or APP_SECRET) must be set to encrypt secrets at rest.",
    );
  }
  return createHash("sha256").update(secret, "utf8").digest();
}

export function encryptSecret(plain: string): string {
  if (plain.length === 0) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    PREFIX + iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decryptSecret(payload: string): string {
  if (payload.length === 0) return "";
  if (!payload.startsWith(PREFIX)) {
    throw new Error("Unsupported secret payload format.");
  }
  const [ivPart, tagPart, dataPart] = payload.split(":");
  // ivPart still has the prefix; strip it.
  const ivB64 = ivPart.slice(PREFIX.length);
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagPart, "base64");
  const ciphertext = Buffer.from(dataPart, "base64");

  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  const plain = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plain.toString("utf8");
}
