"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { VALID_STATUS_TRANSITIONS, type OrderStatusType } from "@/lib/constants";
import type { OrderStatus } from "@/generated/prisma/client";
import { getAdminActionSession } from "@/lib/admin-permissions";

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
  const session = await getAdminActionSession("orders.manage");
  if (!session) return { error: "No autorizado." };

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { name: true, email: true } },
        coupon: { select: { id: true } },
        items: {
          select: {
            productId: true,
            sizeLabel: true,
            quantity: true,
          },
        },
      },
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
          changedBy: changedBy || session.user.id,
        },
      });

      // Restore stock if cancelled or expired
      if (newStatus === "CANCELLED" || newStatus === "EXPIRED") {
        if (order.coupon?.id) {
          await tx.coupon.updateMany({
            where: {
              id: order.coupon.id,
              usedCount: { gt: 0 },
            },
            data: {
              usedCount: { decrement: 1 },
            },
          });
        }

        const itemsToRestore =
          order.items.length > 0
            ? order.items
            : order.productId && order.sizeLabel
              ? [
                  {
                    productId: order.productId,
                    sizeLabel: order.sizeLabel,
                    quantity: 1,
                  },
                ]
              : [];

        await Promise.all(
          itemsToRestore.map((item) =>
            tx.productSize.updateMany({
              where: {
                productId: item.productId,
                sizeLabel: item.sizeLabel,
              },
              data: {
                stock: { increment: item.quantity },
                isAvailable: true,
              },
            })
          )
        );
      }
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch {
    return { error: "Error al actualizar el estado del pedido." };
  }
}

export async function archiveOrder(orderId: string): Promise<ActionResult> {
  const session = await getAdminActionSession("orders.manage");
  if (!session) return { error: "No autorizado." };

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
  const session = await getAdminActionSession("orders.manage");
  if (!session) return { error: "No autorizado." };

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

export async function deleteOrder(orderId: string): Promise<ActionResult> {
  const session = await getAdminActionSession("orders.manage");
  if (!session) return { error: "No autorizado." };

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        coupon: { select: { id: true } },
        items: {
          select: {
            productId: true,
            sizeLabel: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) return { error: "Pedido no encontrado." };

    const shouldRestoreStock =
      order.status === "PENDING" || order.status === "PAYMENT_RECEIVED";

    await prisma.$transaction(async (tx) => {
      if (shouldRestoreStock) {
        if (order.coupon?.id) {
          await tx.coupon.updateMany({
            where: { id: order.coupon.id, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
          });
        }

        const itemsToRestore =
          order.items.length > 0
            ? order.items
            : order.productId && order.sizeLabel
              ? [
                  {
                    productId: order.productId,
                    sizeLabel: order.sizeLabel,
                    quantity: 1,
                  },
                ]
              : [];

        await Promise.all(
          itemsToRestore.map((item) =>
            tx.productSize.updateMany({
              where: {
                productId: item.productId,
                sizeLabel: item.sizeLabel,
              },
              data: {
                stock: { increment: item.quantity },
                isAvailable: true,
              },
            })
          )
        );
      }

      await tx.orderStatusHistory.deleteMany({ where: { orderId } });
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el pedido." };
  }
}

export async function updateOrderDetails(
  orderId: string,
  data: {
    trackingNumber?: string | null;
    adminNotes?: string | null;
    paymentProof?: string | null;
    shippingAddress?: string | null;
  }
): Promise<ActionResult> {
  const session = await getAdminActionSession("orders.manage");
  if (!session) return { error: "No autorizado." };

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
