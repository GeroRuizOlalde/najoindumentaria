"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCustomerSession } from "@/lib/customer-auth";

export type WishlistActionResult = {
  success?: boolean;
  error?: string;
  active?: boolean;
};

export async function toggleWishlistItem(
  productId: string,
  productSlug?: string
): Promise<WishlistActionResult> {
  const session = await getCustomerSession();
  if (!session) return { error: "AUTH_REQUIRED" };

  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        customerId_productId: {
          customerId: session.customerId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: {
          customerId_productId: {
            customerId: session.customerId,
            productId,
          },
        },
      });
      revalidateWishlist(productSlug);
      return { success: true, active: false };
    }

    await prisma.wishlistItem.create({
      data: {
        customerId: session.customerId,
        productId,
      },
    });

    revalidateWishlist(productSlug);
    return { success: true, active: true };
  } catch {
    return { error: "No se pudo actualizar favoritos." };
  }
}

function revalidateWishlist(productSlug?: string) {
  revalidatePath("/cuenta");
  if (productSlug) {
    revalidatePath(`/producto/${productSlug}`);
  }
}
