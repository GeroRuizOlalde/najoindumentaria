import { z } from "zod";

export const productSizeSchema = z.object({
  sizeLabel: z.string().min(1, "Talle requerido"),
  isAvailable: z.boolean(),
});

export const productSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  slug: z.string().min(1, "Slug requerido"),
  brandId: z.string().min(1, "Marca requerida"),
  categoryId: z.string().min(1, "Categoría requerida"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  description: z.string().min(10, "Mínimo 10 caracteres"),
  shortDescription: z.string().max(300).optional().nullable(),
  images: z.array(z.string().url()).min(1, "Al menos una imagen"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean(),
  sizes: z.array(productSizeSchema).min(1, "Al menos un talle"),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
});

export type ProductFormData = z.infer<typeof productSchema>;
