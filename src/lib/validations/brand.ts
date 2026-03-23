import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  slug: z.string().min(1, "Slug requerido"),
  logo: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  banner: z.string().url().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export type BrandFormData = z.infer<typeof brandSchema>;
