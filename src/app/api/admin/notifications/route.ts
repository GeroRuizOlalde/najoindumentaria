import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");

  if (!since) {
    return NextResponse.json({ orders: [], timestamp: new Date().toISOString() });
  }

  const orders = await prisma.order.findMany({
    where: { createdAt: { gt: new Date(since) } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      orderCode: true,
      amount: true,
      createdAt: true,
      customer: { select: { name: true } },
      product: { select: { name: true } },
      items: {
        select: { product: { select: { name: true } } },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    orders,
    timestamp: new Date().toISOString(),
  });
}
