import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verify cron secret for Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find expired PENDING orders
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lte: now },
    },
    select: {
      id: true,
      couponId: true,
      productId: true,
      sizeLabel: true,
      items: {
        select: {
          productId: true,
          sizeLabel: true,
          quantity: true,
        },
      },
    },
  });

  let expiredCount = 0;

  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED", cancelledAt: now },
      });

      // Add status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: "PENDING",
          toStatus: "EXPIRED",
          note: "Reserva expirada automáticamente (48hs)",
          changedBy: "system",
        },
      });

      if (order.couponId) {
        await tx.coupon.updateMany({
          where: {
            id: order.couponId,
            usedCount: { gt: 0 },
          },
          data: {
            usedCount: { decrement: 1 },
          },
        });
      }

      // Restore stock
      const itemsToRestore =
        order.items.length > 0
          ? order.items
          : order.productId && order.sizeLabel
            ? [
                {
                  productId: order.productId,
                  sizeLabel: order.sizeLabel,
                  quantity: 1,
                },
              ]
            : [];

      await Promise.all(
        itemsToRestore.map((item) =>
          tx.productSize.updateMany({
            where: {
              productId: item.productId,
              sizeLabel: item.sizeLabel,
            },
            data: { stock: { increment: item.quantity }, isAvailable: true },
          })
        )
      );
    });

    expiredCount++;
  }

  return NextResponse.json({
    ok: true,
    expired: expiredCount,
    timestamp: now.toISOString(),
  });
}
