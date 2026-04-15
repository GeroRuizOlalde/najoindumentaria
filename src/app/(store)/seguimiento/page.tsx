import type { Metadata } from "next";
import Link from "next/link";
import { getOrderByCode } from "@/lib/queries/orders";
import { ORDER_STATUS_LABELS, type OrderStatusType } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { ReviewForm } from "@/components/store/review-form";
import { TrackingSearch } from "@/components/store/tracking-search";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { formatDateAR, formatPriceFromDecimal } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Seguimiento de pedido",
  description: "Consultá el estado de tu pedido en Najo Indumentaria.",
};

interface Props {
  searchParams: Promise<{ codigo?: string }>;
}

export default async function SeguimientoPage({ searchParams }: Props) {
  const params = await searchParams;
  const code = params.codigo?.trim().toUpperCase();

  const [order, customerSession] = await Promise.all([
    code ? getOrderByCode(code) : null,
    getCustomerSession(),
  ]);

  const orderProducts =
    order?.product
      ? [{
          id: order.product.id,
          slug: order.product.slug,
          name: order.product.name,
          brandName: order.product.brand.name,
        }]
      : order?.items?.map((item) => ({
          id: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          brandName: item.product.brand.name,
        })) ?? [];

  const uniqueProducts = Array.from(
    new Map(orderProducts.map((product) => [product.id, product])).values()
  );

  const existingReviews =
    customerSession && uniqueProducts.length > 0
      ? await prisma.review.findMany({
          where: {
            customerId: customerSession.customerId,
            productId: { in: uniqueProducts.map((product) => product.id) },
          },
        })
      : [];

  const reviewsByProductId = new Map(
    existingReviews.map((review) => [review.productId, review])
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Seguimiento
        </h1>
        <p className="mt-3 text-gray-text">
          Ingresá tu código de pedido para ver el estado.
        </p>
      </div>

      <TrackingSearch initialCode={code} />

      {code && !order && (
        <div className="mt-8 bg-error/5 border border-error/20 p-4 text-center">
          <p className="text-sm text-error">
            No encontramos un pedido con el código &quot;{code}&quot;.
          </p>
          <p className="text-xs text-gray-text mt-1">
            Revisá que el código esté bien escrito. Ejemplo: NAJO-A1B2C3
          </p>
        </div>
      )}

      {order && (
        <div className="mt-8 space-y-6">
          <div className="border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-gray-text">Pedido</p>
                <p className="font-mono text-lg font-bold">{order.orderCode}</p>
              </div>
              <StatusBadge status={order.status as OrderStatusType} />
            </div>

            <div className="bg-off-white p-4 mb-6">
              {order.items.length > 0 ? (
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i}>
                      <p className="font-medium text-sm">
                        {item.product.brand.name} {item.product.name}
                      </p>
                      <p className="text-xs text-gray-text">
                        Talle {item.sizeLabel}
                        {item.quantity > 1 && ` x${item.quantity}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : order.product ? (
                <>
                  <p className="font-medium text-sm">
                    {order.product.brand.name} {order.product.name}
                  </p>
                  <p className="text-xs text-gray-text mt-0.5">
                    Talle {order.sizeLabel}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-text">Producto no disponible</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded border border-border bg-white p-4">
                <p className="text-xs uppercase tracking-wider text-gray-text">
                  Subtotal
                </p>
                <p className="mt-2 font-medium">
                  {formatPriceFromDecimal(order.subtotalAmount)}
                </p>
              </div>

              {order.discountAmount > 0 && (
                <div className="rounded border border-border bg-white p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-text">
                    Descuento
                  </p>
                  <p className="mt-2 font-medium text-success">
                    -{formatPriceFromDecimal(order.discountAmount)}
                  </p>
                </div>
              )}

              <div className="rounded border border-border bg-white p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-gray-text">
                  Total
                </p>
                <p className="mt-2 font-medium">
                  {formatPriceFromDecimal(order.amount)}
                </p>
                {order.couponCode && (
                  <p className="text-xs text-gray-text mt-2">
                    Cupón aplicado: <span className="font-medium">{order.couponCode}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-text">
                Historial
              </p>
              {order.statusHistory.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-black" />
                    {i < order.statusHistory.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">
                      {ORDER_STATUS_LABELS[entry.toStatus as OrderStatusType]}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-gray-text mt-0.5">
                        {entry.note}
                      </p>
                    )}
                    <p className="text-xs text-gray-light mt-0.5">
                      {formatDateAR(entry.createdAt, "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border p-6 bg-white">
            <h2 className="font-heading text-2xl font-bold tracking-tight mb-4">
              Reseñas
            </h2>
            {order.status === "DELIVERED" ? (
              <>
                <p className="text-sm text-gray-text mb-6">
                  Podes dejar una reseña de los productos de este pedido.
                </p>
                {uniqueProducts.length > 0 ? (
                  <div className="space-y-6">
                    {uniqueProducts.map((product) => {
                      const existingReview = reviewsByProductId.get(product.id);
                      return (
                        <div key={product.id} className="rounded border border-border p-4">
                          <div className="mb-4">
                            <p className="text-sm font-medium">{product.brandName} {product.name}</p>
                          </div>
                          {customerSession ? (
                            <ReviewForm
                              productId={product.id}
                              productSlug={product.slug}
                              existingReview={
                                existingReview
                                  ? {
                                      rating: existingReview.rating,
                                      title: existingReview.title,
                                      content: existingReview.content,
                                      status: existingReview.status,
                                    }
                                  : null
                              }
                            />
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-text">
                                Inicia sesión para dejar tu reseña.
                              </p>
                              <Link
                                href="/login"
                                className="inline-flex h-10 items-center justify-center bg-black px-5 text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                              >
                                Iniciar sesión
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-text">
                    No hay productos para reseñar en este pedido.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-text">
                Las reseñas se pueden dejar una vez que el pedido esté marcado como entregado.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
