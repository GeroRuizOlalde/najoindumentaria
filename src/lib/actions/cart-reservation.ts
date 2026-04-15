"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateOrderCode } from "@/lib/utils";
import { RESERVATION_EXPIRY_HOURS } from "@/lib/constants";
import { sendReservationEmail } from "@/lib/email/send-reservation-email";
import { validateCoupon } from "@/lib/coupons";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  sizeId: z.string().min(1),
  sizeLabel: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().positive(),
  productName: z.string().min(1),
});

const cartReservationSchema = z.object({
  items: z.array(cartItemSchema).min(1, "El carrito estÃ¡ vacÃ­o"),
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email invÃ¡lido"),
  phone: z.string().min(8, "TelÃ©fono requerido"),
  province: z.string().min(1, "Provincia requerida"),
  city: z.string().min(1, "Ciudad requerida"),
  address: z.string().optional().nullable(),
  deliveryMethod: z.enum(["SHIPPING", "PICKUP"]),
  preferredContact: z.enum(["WHATSAPP", "EMAIL"]).default("WHATSAPP"),
  customerNotes: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  acceptPolicies: z.literal(true, {
    error: "DebÃ©s aceptar las polÃ­ticas",
  }),
});

export type CartReservationResult = {
  success?: boolean;
  error?: string;
  errors?: Record<string, string>;
  orderCode?: string;
  orderId?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  couponCode?: string;
};

export async function createCartReservation(
  _prev: CartReservationResult,
  formData: FormData
): Promise<CartReservationResult> {
  let items: z.infer<typeof cartItemSchema>[];
  try {
    items = JSON.parse(((formData.get("items") as string) || "[]")) as z.infer<
      typeof cartItemSchema
    >[];
  } catch {
    return { error: "Datos del carrito invÃ¡lidos." };
  }

  const raw = {
    items,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    province: formData.get("province"),
    city: formData.get("city"),
    address: formData.get("address") || null,
    deliveryMethod: formData.get("deliveryMethod"),
    preferredContact: formData.get("preferredContact") || "WHATSAPP",
    customerNotes: formData.get("customerNotes") || null,
    couponCode:
      (formData.get("couponCode") as string)?.trim().toUpperCase() || null,
    acceptPolicies:
      formData.get("acceptPolicies") === "true" ? true : undefined,
  };

  const parsed = cartReservationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field) fieldErrors[field] = issue.message;
    }
    return { errors: fieldErrors };
  }

  const data = parsed.data;

  try {
    const sizeIds = data.items.map((item) => item.sizeId);
    const sizes = await prisma.productSize.findMany({
      where: { id: { in: sizeIds } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            brand: { select: { name: true } },
          },
        },
      },
    });

    const sizeMap = new Map(sizes.map((size) => [size.id, size]));
    for (const item of data.items) {
      const size = sizeMap.get(item.sizeId);
      if (!size) {
        return { error: `Talle no encontrado para ${item.productName}.` };
      }
      if (!size.isAvailable || size.stock < item.quantity) {
        return {
          error: `Stock insuficiente para ${item.productName} (talle ${item.sizeLabel}).`,
        };
      }
      if (size.productId !== item.productId) {
        return {
          error: `El talle no corresponde al producto ${item.productName}.`,
        };
      }
    }

    const orderCode = generateOrderCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESERVATION_EXPIRY_HOURS);

    const subtotalAmount = data.items.reduce(
      (sum, item) =>
        sum + Number(sizeMap.get(item.sizeId)!.product.price) * item.quantity,
      0
    );

    let appliedCoupon:
      | {
          id: string;
          code: string;
          discountAmount: number;
        }
      | null = null;

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode },
      });

      const couponValidation = validateCoupon(
        coupon
          ? {
              active: coupon.active,
              discountType: coupon.discountType,
              value: Number(coupon.value),
              minAmount: coupon.minAmount ? Number(coupon.minAmount) : null,
              maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
              usageLimit: coupon.usageLimit,
              usedCount: coupon.usedCount,
              startsAt: coupon.startsAt,
              endsAt: coupon.endsAt,
            }
          : null,
        subtotalAmount
      );

      if (!couponValidation.valid) {
        return { error: couponValidation.error };
      }

      appliedCoupon = {
        id: coupon!.id,
        code: coupon!.code,
        discountAmount: couponValidation.discountAmount ?? 0,
      };
    }

    const totalAmount = subtotalAmount - (appliedCoupon?.discountAmount ?? 0);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const updated = await tx.productSize.update({
          where: { id: item.sizeId },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.stock < 0) {
          throw new Error(`STOCK_EXHAUSTED:${item.productName}`);
        }

        if (updated.stock === 0) {
          await tx.productSize.update({
            where: { id: item.sizeId },
            data: { isAvailable: false },
          });
        }
      }

      const customer = await tx.customer.upsert({
        where: { email: data.email },
        update: {
          name: data.name,
          phone: data.phone,
          province: data.province,
          city: data.city,
          preferredContact: data.preferredContact,
        },
        create: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          province: data.province,
          city: data.city,
          preferredContact: data.preferredContact,
        },
      });

      const newOrder = await tx.order.create({
        data: {
          orderCode,
          customerId: customer.id,
          productId: data.items.length === 1 ? data.items[0].productId : null,
          sizeLabel: data.items.length === 1 ? data.items[0].sizeLabel : null,
          amount: totalAmount,
          subtotalAmount,
          discountAmount: appliedCoupon?.discountAmount ?? 0,
          couponId: appliedCoupon?.id,
          couponCode: appliedCoupon?.code,
          status: "PENDING",
          deliveryMethod: data.deliveryMethod,
          shippingAddress:
            data.deliveryMethod === "SHIPPING"
              ? `${data.address || ""}, ${data.city}, ${data.province}`
              : null,
          customerNotes: data.customerNotes,
          expiresAt,
        },
      });

      await tx.orderItem.createMany({
        data: data.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          sizeLabel: item.sizeLabel,
          quantity: item.quantity,
          unitPrice: Number(sizeMap.get(item.sizeId)!.product.price),
        })),
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: "PENDING",
          toStatus: "PENDING",
          note: `Reserva creada (${data.items.length} ${data.items.length === 1 ? "producto" : "productos"})`,
          changedBy: "system",
        },
      });

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    try {
      const firstItem = data.items[0];
      const firstSize = sizeMap.get(firstItem.sizeId)!;
      await sendReservationEmail({
        customerName: data.name,
        customerEmail: data.email,
        orderCode: order.orderCode,
        productName:
          data.items.length === 1
            ? firstSize.product.name
            : `${firstSize.product.name} y ${data.items.length - 1} mÃ¡s`,
        brandName: firstSize.product.brand.name,
        sizeLabel: data.items.length === 1 ? firstItem.sizeLabel : "Varios",
        price: totalAmount,
        expiresAt,
      });
    } catch (emailError) {
      console.error("Error al enviar email de reserva:", emailError);
    }

    return {
      success: true,
      orderCode: order.orderCode,
      orderId: order.id,
      subtotalAmount,
      discountAmount: appliedCoupon?.discountAmount ?? 0,
      totalAmount,
      couponCode: appliedCoupon?.code,
    };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("STOCK_EXHAUSTED:")) {
      const productName = err.message.split(":")[1];
      return { error: `Lo sentimos, ${productName} se acaba de agotar.` };
    }

    console.error("Error creating cart reservation:", err);
    return { error: "Error al crear la reserva. IntentÃ¡ de nuevo." };
  }
}
