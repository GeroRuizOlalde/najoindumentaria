"use server";

import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type AddressResult = {
  success?: boolean;
  error?: string;
};

const addressSchema = z.object({
  label: z.string().min(1, "El nombre es obligatorio"),
  address: z.string().min(3, "La dirección es obligatoria"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  province: z.string().min(1, "La provincia es obligatoria"),
  zipCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function addAddress(
  _prev: AddressResult,
  formData: FormData
): Promise<AddressResult> {
  const session = await getCustomerSession();
  if (!session) return { error: "No autenticado." };

  const raw = {
    label: formData.get("label") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    province: formData.get("province") as string,
    zipCode: (formData.get("zipCode") as string) || undefined,
    isDefault: formData.get("isDefault") === "true",
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  try {
    if (data.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: session.customerId },
        data: { isDefault: false },
      });
    }

    await prisma.customerAddress.create({
      data: {
        customerId: session.customerId,
        label: data.label,
        address: data.address,
        city: data.city,
        province: data.province,
        zipCode: data.zipCode || null,
        isDefault: data.isDefault ?? false,
      },
    });

    revalidatePath("/cuenta/direcciones");
    return { success: true };
  } catch {
    return { error: "Error al guardar la dirección." };
  }
}

export async function deleteAddress(addressId: string): Promise<AddressResult> {
  const session = await getCustomerSession();
  if (!session) return { error: "No autenticado." };

  try {
    await prisma.customerAddress.delete({
      where: { id: addressId, customerId: session.customerId },
    });
    revalidatePath("/cuenta/direcciones");
    return { success: true };
  } catch {
    return { error: "Error al eliminar la dirección." };
  }
}

export async function setDefaultAddress(addressId: string): Promise<AddressResult> {
  const session = await getCustomerSession();
  if (!session) return { error: "No autenticado." };

  try {
    await prisma.$transaction([
      prisma.customerAddress.updateMany({
        where: { customerId: session.customerId },
        data: { isDefault: false },
      }),
      prisma.customerAddress.update({
        where: { id: addressId, customerId: session.customerId },
        data: { isDefault: true },
      }),
    ]);
    revalidatePath("/cuenta/direcciones");
    return { success: true };
  } catch {
    return { error: "Error al actualizar la dirección." };
  }
}
