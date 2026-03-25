"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { VALID_STATUS_TRANSITIONS, type OrderStatusType } from "@/lib/constants";
import type { OrderStatus } from "@/generated/prisma/client";
import { sendStatusUpdateEmail } from "@/lib/email/send-status-update-email";

export type ActionResult = {
  success?: boolean;
  error?: string;
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  changedBy?: string
): Promise<ActionResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { select: { name: true, email: true } } },
    });
    if (!order) return { error: "Pedido no encontrado." };

    const validTransitions = VALID_STATUS_TRANSITIONS[order.status as OrderStatusType];
    if (!validTransitions.includes(newStatus as OrderStatusType)) {
      return {
        error: `No se puede cambiar de ${order.status} a ${newStatus}.`,
      };
    }

    const timestamps: Record<string, Date> = {};
    if (newStatus === "PAYMENT_RECEIVED") timestamps.paidAt = new Date();
    if (newStatus === "CONFIRMED") timestamps.confirmedAt = new Date();
    if (newStatus === "SHIPPED") timestamps.shippedAt = new Date();
    if (newStatus === "DELIVERED") timestamps.deliveredAt = new Date();
    if (newStatus === "CANCELLED" || newStatus === "EXPIRED")
      timestamps.cancelledAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus, ...timestamps },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: newStatus,
          note,
          changedBy: changedBy || "admin",
        },
      });

      // Restore stock if cancelled or expired
      if ((newStatus === "CANCELLED" || newStatus === "EXPIRED") && order.productId && order.sizeLabel) {
        await tx.productSize.updateMany({
          where: {
            productId: order.productId,
            sizeLabel: order.sizeLabel,
          },
          data: { stock: { increment: 1 }, isAvailable: true },
        });
      }
    });

    // Send status update email (non-blocking)
    try {
      await sendStatusUpdateEmail({
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        orderCode: order.orderCode,
        newStatus: newStatus as OrderStatusType,
        note,
        trackingNumber: order.trackingNumber ?? undefined,
      });
    } catch (emailError) {
      console.error("Error al enviar email de actualización:", emailError);
    }

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch {
    return { error: "Error al actualizar el estado del pedido." };
  }
}

export async function archiveOrder(orderId: string): Promise<ActionResult> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { archivedAt: new Date() },
    });
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch {
    return { error: "Error al archivar el pedido." };
  }
}

export async function unarchiveOrder(orderId: string): Promise<ActionResult> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { archivedAt: null },
    });
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch {
    return { error: "Error al desarchivar el pedido." };
  }
}

export async function updateOrderDetails(
  orderId: string,
  data: {
    trackingNumber?: string | null;
    adminNotes?: string | null;
  }
): Promise<ActionResult> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data,
    });
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch {
    return { error: "Error al actualizar el pedido." };
  }
}
