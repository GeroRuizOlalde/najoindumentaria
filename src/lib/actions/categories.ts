"use server";

import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export type ActionResult = {
  success?: boolean;
  error?: string;
};

export async function createCategory(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string || slugify(formData.get("name") as string),
    image: (formData.get("image") as string) || null,
    description: (formData.get("description") as string) || null,
    sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    active: formData.get("active") === "true",
  };

  const result = categorySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    await prisma.category.create({ data: result.data });
    revalidatePath("/admin/categorias");
    return { success: true };
  } catch {
    return { error: "Error al crear la categoría. Puede que el nombre ya exista." };
  }
}

export async function updateCategory(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string || slugify(formData.get("name") as string),
    image: (formData.get("image") as string) || null,
    description: (formData.get("description") as string) || null,
    sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    active: formData.get("active") === "true",
  };

  const result = categorySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    await prisma.category.update({ where: { id }, data: result.data });
    revalidatePath("/admin/categorias");
    return { success: true };
  } catch {
    return { error: "Error al actualizar la categoría." };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (category && category._count.products > 0) {
      return {
        error: "No se puede eliminar una categoría con productos asociados.",
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categorias");
    return { success: true };
  } catch {
    return { error: "Error al eliminar la categoría." };
  }
}
