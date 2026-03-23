import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  slug: z.string().min(1, "Slug requerido"),
  image: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
