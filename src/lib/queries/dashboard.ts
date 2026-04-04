import { prisma } from "@/lib/prisma";

const COMPLETED_ORDER_STATUSES = [
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
] as const;

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProducts,
    totalOrdersThisMonth,
    pendingOrders,
    confirmedRevenue,
    newCustomers,
  ] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.order.count({
      where: { status: "PENDING" },
    }),
    prisma.order.aggregate({
      _sum: { amount: true },
      where: {
        status: { in: [...COMPLETED_ORDER_STATUSES] },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.customer.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
  ]);

  return {
    totalProducts,
    totalOrdersThisMonth,
    pendingOrders,
    confirmedRevenue: Number(confirmedRevenue._sum.amount || 0),
    newCustomers,
  };
}

export async function getCommercialInsights() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [completedOrders, discountsAggregate, couponOrders, repeatCustomersRaw] =
    await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfMonth },
          status: { in: [...COMPLETED_ORDER_STATUSES] },
        },
        select: {
          amount: true,
        },
      }),
      prisma.order.aggregate({
        _sum: { discountAmount: true },
        where: {
          createdAt: { gte: startOfMonth },
          discountAmount: { gt: 0 },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth },
          couponId: { not: null },
        },
      }),
      prisma.customer.findMany({
        select: {
          orders: {
            where: {
              status: { in: [...COMPLETED_ORDER_STATUSES] },
            },
            select: { id: true },
          },
        },
      }),
    ]);

  const soldItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: startOfMonth },
        status: { in: [...COMPLETED_ORDER_STATUSES] },
      },
    },
    select: {
      quantity: true,
      product: {
        select: {
          brand: { select: { name: true } },
          category: { select: { name: true } },
        },
      },
    },
  });

  const aggregateSales = (values: { label: string; quantity: number }[]) => {
    const counts = new Map<string, number>();

    for (const value of values) {
      counts.set(value.label, (counts.get(value.label) ?? 0) + value.quantity);
    }

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const completedRevenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.amount),
    0
  );

  return {
    averageOrderValue:
      completedOrders.length > 0 ? completedRevenue / completedOrders.length : 0,
    completedOrdersCount: completedOrders.length,
    monthlyDiscounts: Number(discountsAggregate._sum.discountAmount || 0),
    couponOrders,
    repeatCustomers: repeatCustomersRaw.filter(
      (customer) => customer.orders.length > 1
    ).length,
    topBrands: aggregateSales(
      soldItems.map((item) => ({
        label: item.product.brand.name,
        quantity: item.quantity,
      }))
    ),
    topCategories: aggregateSales(
      soldItems.map((item) => ({
        label: item.product.category.name,
        quantity: item.quantity,
      }))
    ),
  };
}

export async function getBestWorstSellingProducts() {
  const soldItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { in: [...COMPLETED_ORDER_STATUSES] },
      },
    },
    select: {
      productId: true,
      quantity: true,
    },
  });

  if (soldItems.length === 0) return { best: null, worst: null };

  const quantityByProduct = new Map<string, number>();

  for (const item of soldItems) {
    quantityByProduct.set(
      item.productId,
      (quantityByProduct.get(item.productId) ?? 0) + item.quantity
    );
  }

  const ranking = Array.from(quantityByProduct.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const bestId = ranking[0][0];
  const worstId = ranking[ranking.length - 1][0];

  const [best, worst] = await Promise.all([
    prisma.product.findUnique({
      where: { id: bestId },
      select: { name: true, images: true, brand: { select: { name: true } } },
    }),
    bestId === worstId
      ? null
      : prisma.product.findUnique({
          where: { id: worstId },
          select: {
            name: true,
            images: true,
            brand: { select: { name: true } },
          },
        }),
  ]);

  return {
    best: best ? { ...best, salesCount: ranking[0][1] } : null,
    worst:
      worst && bestId !== worstId
        ? {
            ...worst,
            salesCount: ranking[ranking.length - 1][1],
          }
        : null,
  };
}

export async function getRecentOrders(limit = 5) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, email: true } },
      product: {
        select: {
          name: true,
          images: true,
          brand: { select: { name: true } },
        },
      },
      items: {
        take: 1,
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getAlerts() {
  const now = new Date();
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const [expiringOrders, outOfStockProducts] = await Promise.all([
    prisma.order.count({
      where: {
        status: "PENDING",
        expiresAt: { lte: sixHoursFromNow, gt: now },
      },
    }),
    prisma.product.count({
      where: {
        status: "ACTIVE",
        sizes: { none: { isAvailable: true, stock: { gt: 0 } } },
      },
    }),
  ]);

  return { expiringOrders, outOfStockProducts };
}
