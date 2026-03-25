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
    select: { id: true, productId: true, sizeLabel: true },
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

      // Restore stock
      if (order.productId && order.sizeLabel) {
        await tx.productSize.updateMany({
          where: {
            productId: order.productId,
            sizeLabel: order.sizeLabel,
          },
          data: { stock: { increment: 1 }, isAvailable: true },
        });
      }
    });

    expiredCount++;
  }

  return NextResponse.json({
    ok: true,
    expired: expiredCount,
    timestamp: now.toISOString(),
  });
}
