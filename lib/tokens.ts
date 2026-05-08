import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Single-use, opaque token utilities.
 *
 * The plain-text token is given to the user (e.g. emailed). Only the SHA-256
 * hash is stored in the database, so a database leak doesn't reveal valid
 * tokens. Comparison is constant-time to avoid timing attacks.
 */

export const TOKEN_BYTES = 32; // 256 bits of entropy

export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function safeCompareHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export function isExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

/** Add `hours` hours to `from` and return the resulting Date. */
export function expiresIn(hours: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
}
