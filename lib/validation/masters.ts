import { z } from "zod";

const nullableInt = z
  .union([z.number().int(), z.string().trim().min(1)])
  .transform((value) => (typeof value === "number" ? value : Number.parseInt(value, 10)))
  .pipe(z.number().int())
  .optional()
  .nullable();

export const masterInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  nameNative: z.string().trim().optional().nullable(),
  overview: z.string().trim().optional().nullable(),
  yearBorn: nullableInt,
  yearDied: nullableInt,
  gender: z.string().trim().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  isRoot: z.boolean().optional().nullable(),
  parentMasterId: z.number().int().optional().nullable(),
  relationshipTypeId: z.number().int().optional().nullable(),
});

export const wikiInputSchema = z.object({
  content: z.string(),
});
