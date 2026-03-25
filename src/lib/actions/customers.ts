"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success?: boolean;
  error?: string;
};

export async function deleteAllCustomers(): Promise<ActionResult> {
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
