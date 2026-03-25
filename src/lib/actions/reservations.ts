"use server";

import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations/reservation";
import { generateOrderCode } from "@/lib/utils";
import { RESERVATION_EXPIRY_HOURS } from "@/lib/constants";
import { sendReservationEmail } from "@/lib/email/send-reservation-email";

export type ReservationResult = {
  success?: boolean;
  error?: string;
  errors?: Record<string, string>;
  orderCode?: string;
  orderId?: string;
};

export async function createReservation(
  _prev: ReservationResult,
  formData: FormData
): Promise<ReservationResult> {
  const raw = {
    productId: formData.get("productId"),
    sizeId: formData.get("sizeId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    province: formData.get("province"),
    city: formData.get("city"),
    address: formData.get("address") || null,
    deliveryMethod: formData.get("deliveryMethod"),
    preferredContact: formData.get("preferredContact") || "WHATSAPP",
    customerNotes: formData.get("customerNotes") || null,
    acceptPolicies: formData.get("acceptPolicies") === "true" ? true : undefined,
  };

  const parsed = reservationSchema.safeParse(raw);
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
    // Find product and size
    const size = await prisma.productSize.findUnique({
      where: { id: data.sizeId },
      include: { product: { select: { id: true, name: true, price: true, brand: { select: { name: true } } } } },
    });

    if (!size) return { error: "Talle no encontrado." };
    if (!size.isAvailable || size.stock <= 0)
      return { error: "Este talle no tiene stock disponible." };
    if (size.productId !== data.productId)
      return { error: "El talle no corresponde al producto." };

    const orderCode = generateOrderCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESERVATION_EXPIRY_HOURS);

    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock
      const updated = await tx.productSize.update({
        where: { id: data.sizeId },
        data: { stock: { decrement: 1 } },
      });
      if (updated.stock < 0) {
        throw new Error("STOCK_EXHAUSTED");
      }
      // Mark unavailable if no stock left
      if (updated.stock === 0) {
        await tx.productSize.update({
          where: { id: data.sizeId },
          data: { isAvailable: false },
        });
      }

      // Find or create customer
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

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          customerId: customer.id,
          productId: data.productId,
          sizeLabel: size.sizeLabel,
          amount: size.product.price,
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

      // Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: "PENDING",
          toStatus: "PENDING",
          note: "Reserva creada",
          changedBy: "system",
        },
      });

      return newOrder;
    });

    // Send confirmation email (non-blocking)
    try {
      await sendReservationEmail({
        customerName: data.name,
        customerEmail: data.email,
        orderCode: order.orderCode,
        productName: size.product.name,
        brandName: size.product.brand.name,
        sizeLabel: size.sizeLabel,
        price: Number(size.product.price),
        expiresAt,
      });
    } catch (emailError) {
      console.error("Error al enviar email de reserva:", emailError);
    }

    return { success: true, orderCode: order.orderCode, orderId: order.id };
  } catch (err) {
    if (err instanceof Error && err.message === "STOCK_EXHAUSTED") {
      return { error: "Lo sentimos, este talle se acaba de agotar." };
    }
    return { error: "Error al crear la reserva. Intentá de nuevo." };
  }
}
