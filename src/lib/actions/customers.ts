"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminActionSession } from "@/lib/admin-permissions";

export type ActionResult = {
  success?: boolean;
  error?: string;
};

export async function deleteCustomer(customerId: string): Promise<ActionResult> {
  const session = await getAdminActionSession("customers.manage");
  if (!session) return { error: "No autorizado." };

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!customer) return { error: "Cliente no encontrado." };

    await prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        where: { customerId },
        select: { id: true },
      });
      const orderIds = orders.map((o) => o.id);

      if (orderIds.length > 0) {
        await tx.orderStatusHistory.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.order.deleteMany({ where: { id: { in: orderIds } } });
      }

      await tx.customer.delete({ where: { id: customerId } });
    });

    revalidatePath("/admin/clientes");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el cliente." };
  }
}

export async function deleteAllCustomers(): Promise<ActionResult> {
  const session = await getAdminActionSession("customers.manage");
  if (!session) return { error: "No autorizado." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.deleteMany();
      await tx.order.deleteMany();
      await tx.customer.deleteMany();
    });

    revalidatePath("/admin/clientes");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch {
    return { error: "Error al eliminar los clientes." };
  }
}
