"use server";

import { prisma } from "@/lib/prisma";
import { brandSchema } from "@/lib/validations/brand";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { getAdminActionSession } from "@/lib/admin-permissions";
import { redirect } from "next/navigation";

export type ActionResult = {
  success?: boolean;
  error?: string;
};

export async function createBrand(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await getAdminActionSession("brands.manage");
  if (!session) return { error: "No autorizado." };

  const raw = {
    name: formData.get("name") as string,
    slug:
      ((formData.get("slug") as string) || slugify(formData.get("name") as string)),
    logo: (formData.get("logo") as string) || null,
    description: (formData.get("description") as string) || null,
    banner: (formData.get("banner") as string) || null,
    sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    active: formData.get("active") === "true",
  };

  const result = brandSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    await prisma.brand.create({ data: result.data });
    revalidatePath("/admin/marcas");
  } catch {
    return { error: "Error al crear la marca. Puede que el nombre ya exista." };
  }

  redirect("/admin/marcas");
}

export async function updateBrand(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await getAdminActionSession("brands.manage");
  if (!session) return { error: "No autorizado." };

  const raw = {
    name: formData.get("name") as string,
    slug:
      ((formData.get("slug") as string) || slugify(formData.get("name") as string)),
    logo: (formData.get("logo") as string) || null,
    description: (formData.get("description") as string) || null,
    banner: (formData.get("banner") as string) || null,
    sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    active: formData.get("active") === "true",
  };

  const result = brandSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    await prisma.brand.update({ where: { id }, data: result.data });
    revalidatePath("/admin/marcas");
  } catch {
    return { error: "Error al actualizar la marca." };
  }

  redirect("/admin/marcas");
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  const session = await getAdminActionSession("brands.manage");
  if (!session) return { error: "No autorizado." };

  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (brand && brand._count.products > 0) {
      return {
        error: "No se puede eliminar una marca con productos asociados.",
      };
    }

    await prisma.brand.delete({ where: { id } });
    revalidatePath("/admin/marcas");
    return { success: true };
  } catch {
    return { error: "Error al eliminar la marca." };
  }
}

export async function deleteAllBrands(): Promise<ActionResult> {
  const session = await getAdminActionSession("brands.manage");
  if (!session) return { error: "No autorizado." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.deleteMany();
      await tx.order.deleteMany();
      await tx.productSize.deleteMany();
      await tx.product.deleteMany();
      await tx.brand.deleteMany();
    });

    revalidatePath("/admin/marcas");
    revalidatePath("/admin/productos");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    revalidatePath("/shop");
    return { success: true };
  } catch {
    return { error: "Error al eliminar las marcas." };
  }
}

export async function toggleBrandActive(id: string): Promise<ActionResult> {
  const session = await getAdminActionSession("brands.manage");
  if (!session) return { error: "No autorizado." };

  try {
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return { error: "Marca no encontrada." };

    await prisma.brand.update({
      where: { id },
      data: { active: !brand.active },
    });
    revalidatePath("/admin/marcas");
    return { success: true };
  } catch {
    return { error: "Error al cambiar el estado." };
  }
}
