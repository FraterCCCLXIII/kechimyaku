import { z } from "zod";

export const smtpSettingsSchema = z.object({
  host: z.string().trim().min(1, "Host is required").max(255),
  port: z.coerce
    .number()
    .int()
    .min(1, "Port must be between 1 and 65535")
    .max(65535),
  secure: z.boolean(),
  username: z.string().trim().max(255).default(""),
  /**
   * Optional: when omitted (or empty), the existing stored password is kept.
   * Send an explicit empty string only when the caller intends to clear the
   * password — the form always sends `null`/`undefined` for "leave unchanged".
   */
  password: z.string().max(1024).optional(),
  fromAddress: z
    .string()
    .trim()
    .email("Enter a valid From email address")
    .max(254),
  fromName: z.string().trim().max(255).optional().or(z.literal("")),
  baseUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .max(1024)
    .optional()
    .or(z.literal("")),
});

export const smtpTestSchema = z.object({
  to: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254),
});
