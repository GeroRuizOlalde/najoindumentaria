import { prisma } from "@/lib/prisma";

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
        status: { in: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] },
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

export async function getRecentOrders(limit = 5) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, email: true } },
      product: { select: { name: true, images: true, brand: { select: { name: true } } } },
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
        sizes: { none: { isAvailable: true } },
      },
    }),
  ]);

  return { expiringOrders, outOfStockProducts };
}
