import type { CouponDiscountType } from "@/generated/prisma/client";

export interface CouponLike {
  active: boolean;
  discountType: CouponDiscountType;
  value: number;
  minAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount?: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

export function calculateCouponDiscount(
  subtotal: number,
  coupon: Pick<CouponLike, "discountType" | "value" | "maxDiscount">
) {
  if (subtotal <= 0) return 0;

  const rawDiscount =
    coupon.discountType === "PERCENTAGE"
      ? (subtotal * coupon.value) / 100
      : coupon.value;

  const cappedDiscount = coupon.maxDiscount
    ? Math.min(rawDiscount, coupon.maxDiscount)
    : rawDiscount;

  return Math.max(0, Math.min(subtotal, Number(cappedDiscount.toFixed(2))));
}

export function validateCoupon(
  coupon: CouponLike | null,
  subtotal: number,
  now = new Date()
) {
  if (!coupon) {
    return { valid: false, error: "Cupón no encontrado." };
  }

  if (!coupon.active) {
    return { valid: false, error: "Este cupón no está activo." };
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, error: "Este cupón todavía no está vigente." };
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    return { valid: false, error: "Este cupón ya venció." };
  }

  if (coupon.minAmount && subtotal < coupon.minAmount) {
    return {
      valid: false,
      error: `Este cupón requiere un mínimo de ${coupon.minAmount}.`,
    };
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    (coupon.usedCount ?? 0) >= coupon.usageLimit
  ) {
    return { valid: false, error: "Este cupón ya alcanzó su límite de uso." };
  }

  return {
    valid: true,
    discountAmount: calculateCouponDiscount(subtotal, coupon),
  };
}
