import { prisma } from "@/lib/prisma";

export async function customerHasDeliveredProduct(
  customerId: string,
  productId: string
) {
  const order = await prisma.order.findFirst({
    where: {
      customerId,
      status: "DELIVERED",
      OR: [
        { productId },
        {
          items: {
            some: { productId },
          },
        },
      ],
    },
    select: { id: true },
  });

  return !!order;
}
