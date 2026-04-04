"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCustomerSession } from "@/lib/customer-auth";
import { getAdminActionSession } from "@/lib/admin-permissions";
import type { ReviewStatus } from "@/generated/prisma/client";

const submitReviewSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional().nullable(),
  content: z.string().min(10, "Escribe una reseña mas completa."),
});

export type ReviewActionResult = {
  success?: boolean;
  error?: string;
};

export async function submitProductReview(
  _prev: ReviewActionResult,
  formData: FormData
): Promise<ReviewActionResult> {
  const session = await getCustomerSession();
  if (!session) return { error: "Debes iniciar sesion para dejar una reseña." };

  const parsed = submitReviewSchema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    rating: formData.get("rating"),
    title: ((formData.get("title") as string) || "").trim() || null,
    content: ((formData.get("content") as string) || "").trim(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Datos invalidos." };
  }

  try {
    await prisma.review.upsert({
      where: {
        productId_customerId: {
          productId: parsed.data.productId,
          customerId: session.customerId,
        },
      },
      update: {
        rating: parsed.data.rating,
        title: parsed.data.title,
        content: parsed.data.content,
        status: "PENDING",
      },
      create: {
        productId: parsed.data.productId,
        customerId: session.customerId,
        rating: parsed.data.rating,
        title: parsed.data.title,
        content: parsed.data.content,
        status: "PENDING",
      },
    });

    revalidatePath(`/producto/${parsed.data.productSlug}`);
    revalidatePath("/cuenta");
    revalidatePath("/admin/resenas");
    return { success: true };
  } catch {
    return { error: "No se pudo guardar la reseña." };
  }
}

export async function updateReviewStatus(
  reviewId: string,
  status: ReviewStatus
): Promise<ReviewActionResult> {
  const session = await getAdminActionSession("reviews.manage");
  if (!session) return { error: "No autorizado." };

  try {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status },
      select: {
        product: { select: { slug: true } },
      },
    });

    revalidatePath("/admin/resenas");
    revalidatePath(`/producto/${review.product.slug}`);
    revalidatePath("/cuenta");
    return { success: true };
  } catch {
    return { error: "No se pudo actualizar la reseña." };
  }
}

export async function deleteReview(reviewId: string): Promise<ReviewActionResult> {
  const session = await getAdminActionSession("reviews.manage");
  if (!session) return { error: "No autorizado." };

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        product: { select: { slug: true } },
      },
    });

    if (!review) return { error: "Reseña no encontrada." };

    await prisma.review.delete({ where: { id: reviewId } });

    revalidatePath("/admin/resenas");
    revalidatePath(`/producto/${review.product.slug}`);
    revalidatePath("/cuenta");
    return { success: true };
  } catch {
    return { error: "No se pudo eliminar la reseña." };
  }
}
