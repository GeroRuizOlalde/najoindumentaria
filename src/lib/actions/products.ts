"use server";

import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = {
  success?: boolean;
  error?: string;
};

export async function createProduct(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    brandId: formData.get("brandId") as string,
    categoryId: formData.get("categoryId") as string,
    price: parseFloat(formData.get("price") as string),
    compareAtPrice: formData.get("compareAtPrice")
      ? parseFloat(formData.get("compareAtPrice") as string)
      : null,
    description: formData.get("description") as string,
    shortDescription: (formData.get("shortDescription") as string) || null,
    images: JSON.parse((formData.get("images") as string) || "[]"),
    status: formData.get("status") as string,
    featured: formData.get("featured") === "true",
    sizes: JSON.parse((formData.get("sizes") as string) || "[]"),
    metaTitle: (formData.get("metaTitle") as string) || null,
    metaDescription: (formData.get("metaDescription") as string) || null,
    sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
  };

  const result = productSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { sizes, ...productData } = result.data;

  try {
    await prisma.product.create({
      data: {
        ...productData,
        sizes: {
          create: sizes.map((s) => ({
            sizeLabel: s.sizeLabel,
            isAvailable: s.isAvailable,
            stock: s.isAvailable ? 1 : 0,
          })),
        },
      },
    });

    revalidatePath("/admin/productos");
    revalidatePath("/shop");
  } catch {
    return { error: "Error al crear el producto. Puede que el slug ya exista." };
  }

  redirect("/admin/productos");
}

export async function updateProduct(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    brandId: formData.get("brandId") as string,
    categoryId: formData.get("categoryId") as string,
    price: parseFloat(formData.get("price") as string),
    compareAtPrice: formData.get("compareAtPrice")
      ? parseFloat(formData.get("compareAtPrice") as string)
      : null,
    description: formData.get("description") as string,
    shortDescription: (formData.get("shortDescription") as string) || null,
    images: JSON.parse((formData.get("images") as string) || "[]"),
    status: formData.get("status") as string,
    featured: formData.get("featured") === "true",
    sizes: JSON.parse((formData.get("sizes") as string) || "[]"),
    metaTitle: (formData.get("metaTitle") as string) || null,
    metaDescription: (formData.get("metaDescription") as string) || null,
    sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
  };

  const result = productSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { sizes, ...productData } = result.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: productData,
      });

      // Delete existing sizes and recreate
      await tx.productSize.deleteMany({ where: { productId: id } });
      await tx.productSize.createMany({
        data: sizes.map((s) => ({
          productId: id,
          sizeLabel: s.sizeLabel,
          isAvailable: s.isAvailable,
          stock: s.isAvailable ? 1 : 0,
        })),
      });
    });

    revalidatePath("/admin/productos");
    revalidatePath(`/producto/${result.data.slug}`);
    revalidatePath("/shop");
  } catch {
    return { error: "Error al actualizar el producto." };
  }

  redirect("/admin/productos");
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    revalidatePath("/admin/productos");
    revalidatePath("/shop");
    return { success: true };
  } catch {
    return { error: "Error al archivar el producto." };
  }
}

export async function toggleFeatured(id: string): Promise<ActionResult> {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return { error: "Producto no encontrado." };

    await prisma.product.update({
      where: { id },
      data: { featured: !product.featured },
    });
    revalidatePath("/admin/productos");
    return { success: true };
  } catch {
    return { error: "Error al cambiar el estado." };
  }
}
