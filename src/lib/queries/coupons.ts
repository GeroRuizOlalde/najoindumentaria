import { prisma } from "@/lib/prisma";

interface CouponFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export async function getCoupons(filters: CouponFilters = {}) {
  const { search, active, page = 1, limit = 20 } = filters;

  const where = {
    ...(active !== undefined && { active }),
    ...(search && {
      OR: [
        { code: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { orders: true } },
      },
    }),
    prisma.coupon.count({ where }),
  ]);

  return {
    coupons,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getCouponById(id: string) {
  return prisma.coupon.findUnique({
    where: { id },
  });
}
