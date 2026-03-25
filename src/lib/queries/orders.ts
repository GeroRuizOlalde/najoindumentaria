import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
  archived?: boolean;
}

export async function getOrders(filters: OrderFilters = {}) {
  const { status, search, page = 1, limit = 20, archived = false } = filters;

  const where = {
    ...(status && { status }),
    ...(archived
      ? { archivedAt: { not: null } }
      : { archivedAt: null }),
    ...(search && {
      OR: [
        { orderCode: { contains: search, mode: "insensitive" as const } },
        {
          customer: {
            name: { contains: search, mode: "insensitive" as const },
          },
        },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        product: {
          select: {
            name: true,
            images: true,
            brand: { select: { name: true } },
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                brand: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, totalPages: Math.ceil(total / limit), currentPage: page };
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      product: {
        include: {
          brand: { select: { name: true } },
          category: { select: { name: true } },
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
              slug: true,
              brand: { select: { name: true } },
            },
          },
        },
      },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getOrderByCode(code: string) {
  return prisma.order.findUnique({
    where: { orderCode: code },
    include: {
      product: {
        select: {
          name: true,
          images: true,
          brand: { select: { name: true } },
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
              brand: { select: { name: true } },
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "asc" },
        select: { toStatus: true, createdAt: true, note: true },
      },
    },
  });
}
