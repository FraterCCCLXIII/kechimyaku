import { z } from "zod";
import { ROLES } from "@/lib/roles";

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(254);

const usernameSchema = z
  .string()
  .trim()
  .min(2, "Username must be at least 2 characters")
  .max(64)
  .regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, dot, underscore, hyphen only");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(256, "Password is too long");

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "member"] as const),
});

export const changeRoleSchema = z.object({
  role: z.enum(ROLES),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
  username: usernameSchema,
  password: passwordSchema,
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export const changeOwnEmailSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  email: emailSchema,
});

export {
  emailSchema as emailFieldSchema,
  usernameSchema as usernameFieldSchema,
  passwordSchema as passwordFieldSchema,
};
