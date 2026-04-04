"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminActionSession } from "@/lib/admin-permissions";
import { couponSchema } from "@/lib/validations/coupon";

export type CouponActionResult = {
  success?: boolean;
  error?: string;
};

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const stringValue = (value as string | null)?.trim();
  if (!stringValue) return null;

  const parsed = Number(stringValue);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  const stringValue = (value as string | null)?.trim();
  if (!stringValue) return null;

  const parsed = new Date(stringValue);
  return Number.isNaN(parsed.getTime()) ? new Date("invalid") : parsed;
}

function parseCouponPayload(formData: FormData) {
  return couponSchema.safeParse({
    code: ((formData.get("code") as string) || "").trim().toUpperCase(),
    description: ((formData.get("description") as string) || "").trim() || null,
    discountType: formData.get("discountType"),
    value: Number(formData.get("value")),
    minAmount: parseOptionalNumber(formData.get("minAmount")),
    maxDiscount: parseOptionalNumber(formData.get("maxDiscount")),
    usageLimit: parseOptionalNumber(formData.get("usageLimit")),
    active: formData.get("active") === "true",
    startsAt: parseOptionalDate(formData.get("startsAt")),
    endsAt: parseOptionalDate(formData.get("endsAt")),
  });
}

export async function createCoupon(
  _prev: CouponActionResult,
  formData: FormData
): Promise<CouponActionResult> {
  const session = await getAdminActionSession("coupons.manage");
  if (!session) return { error: "No autorizado." };

  const parsed = parseCouponPayload(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Datos invalidos." };
  }

  try {
    await prisma.coupon.create({
      data: parsed.data,
    });
  } catch {
    return { error: "No se pudo crear el cupon." };
  }

  revalidatePath("/admin/cupones");
  redirect("/admin/cupones");
}

export async function updateCoupon(
  id: string,
  _prev: CouponActionResult,
  formData: FormData
): Promise<CouponActionResult> {
  const session = await getAdminActionSession("coupons.manage");
  if (!session) return { error: "No autorizado." };

  const parsed = parseCouponPayload(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Datos invalidos." };
  }

  try {
    await prisma.coupon.update({
      where: { id },
      data: parsed.data,
    });
  } catch {
    return { error: "No se pudo actualizar el cupon." };
  }

  revalidatePath("/admin/cupones");
  redirect("/admin/cupones");
}

export async function toggleCouponActive(
  id: string
): Promise<CouponActionResult> {
  const session = await getAdminActionSession("coupons.manage");
  if (!session) return { error: "No autorizado." };

  try {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return { error: "Cupon no encontrado." };

    await prisma.coupon.update({
      where: { id },
      data: { active: !coupon.active },
    });
    revalidatePath("/admin/cupones");
    return { success: true };
  } catch {
    return { error: "No se pudo cambiar el estado del cupon." };
  }
}

export async function deleteCoupon(id: string): Promise<CouponActionResult> {
  const session = await getAdminActionSession("coupons.manage");
  if (!session) return { error: "No autorizado." };

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: { select: { orders: true } },
      },
    });

    if (!coupon) return { error: "Cupon no encontrado." };
    if (coupon._count.orders > 0) {
      return {
        error: "No se puede eliminar un cupon que ya fue usado en pedidos.",
      };
    }

    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/cupones");
    return { success: true };
  } catch {
    return { error: "No se pudo eliminar el cupon." };
  }
}
