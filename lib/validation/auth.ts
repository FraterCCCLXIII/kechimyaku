import { z } from "zod";

export const loginSchema = z.object({
  /** Email address or username — login accepts either. */
  identifier: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});
