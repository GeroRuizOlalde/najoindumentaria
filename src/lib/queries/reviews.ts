import { prisma } from "@/lib/prisma";
import type { ReviewStatus } from "@/generated/prisma/client";

interface ReviewFilters {
  search?: string;
  status?: ReviewStatus;
  page?: number;
  limit?: number;
}

export async function getReviews(filters: ReviewFilters = {}) {
  const { search, status, page = 1, limit = 20 } = filters;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { content: { contains: search, mode: "insensitive" as const } },
        { customer: { name: { contains: search, mode: "insensitive" as const } } },
        { product: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            name: true,
            slug: true,
            brand: { select: { name: true } },
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}
