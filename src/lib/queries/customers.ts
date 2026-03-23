import { prisma } from "@/lib/prisma";

interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCustomers(filters: CustomerFilters = {}) {
  const { search, page = 1, limit = 20 } = filters;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { orders: true } },
        orders: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return { customers, total, totalPages: Math.ceil(total / limit) };
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              name: true,
              brand: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}
