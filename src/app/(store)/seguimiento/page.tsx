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
import {
  normalizeEmail,
  verifyOrderTrackingToken,
} from "@/lib/order-tracking";

export const metadata: Metadata = {
  title: "Seguimiento de pedido",
  description: "Consultá el estado de tu pedido en Najo Indumentaria.",
};

interface Props {
  searchParams: Promise<{ codigo?: string; email?: string; token?: string }>;
}

export default async function SeguimientoPage({ searchParams }: Props) {
  const params = await searchParams;
  const code = params.codigo?.trim().toUpperCase();
  const email = params.email?.trim().toLowerCase();
  const token = params.token?.trim();

  const [order, customerSession] = await Promise.all([
    code ? getOrderByCode(code) : null,
    getCustomerSession(),
  ]);

  const trackingAccess = token ? await verifyOrderTrackingToken(token) : null;

  const hasTrackingAccess =
    !!order &&
    ((customerSession && order.customer.id === customerSession.customerId) ||
      (trackingAccess &&
        trackingAccess.orderId === order.id &&
        trackingAccess.email === normalizeEmail(order.customer.email)) ||
      (email && normalizeEmail(order.customer.email) === normalizeEmail(email)));

  const visibleOrder = hasTrackingAccess ? order : null;

  const orderProducts =
    visibleOrder?.product
      ? [
          {
            id: visibleOrder.product.id,
            slug: visibleOrder.product.slug,
            name: visibleOrder.product.name,
            brandName: visibleOrder.product.brand.name,
          },
        ]
      : visibleOrder?.items?.map((item) => ({
          id: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          brandName: item.product.brand.name,
        })) ?? [];

  const uniqueProducts = Array.from(
    new Map(orderProducts.map((product) => [product.id, product])).values()
  );

  const existingReviews =
    customerSession &&
    visibleOrder &&
    visibleOrder.customer.id === customerSession.customerId &&
    uniqueProducts.length > 0
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
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Seguimiento
        </h1>
        <p className="mt-3 text-gray-text">
          Ingresá tu código y el email de la compra para ver el estado.
        </p>
      </div>

      <TrackingSearch
        initialCode={code}
        initialEmail={email}
        requireEmail={!token && !(customerSession && visibleOrder)}
      />

      {code && !visibleOrder && (
        <div className="mt-8 border border-error/20 bg-error/5 p-4 text-center">
          <p className="text-sm text-error">
            No pudimos encontrar un pedido con esos datos.
          </p>
          <p className="mt-1 text-xs text-gray-text">
            Revisá el código y el email usados en la reserva.
          </p>
        </div>
      )}

      {visibleOrder && (
        <div className="mt-8 space-y-6">
          <div className="border border-border p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-text">Pedido</p>
                <p className="font-mono text-lg font-bold">
                  {visibleOrder.orderCode}
                </p>
              </div>
              <StatusBadge status={visibleOrder.status as OrderStatusType} />
            </div>

            <div className="mb-6 bg-off-white p-4">
              {visibleOrder.items.length > 0 ? (
                <div className="space-y-1">
                  {visibleOrder.items.map((item, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium">
                        {item.product.brand.name} {item.product.name}
                      </p>
                      <p className="text-xs text-gray-text">
                        Talle {item.sizeLabel}
                        {item.quantity > 1 && ` x${item.quantity}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : visibleOrder.product ? (
                <>
                  <p className="text-sm font-medium">
                    {visibleOrder.product.brand.name} {visibleOrder.product.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-text">
                    Talle {visibleOrder.sizeLabel}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-text">Producto no disponible</p>
              )}
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-border bg-white p-4">
                <p className="text-xs uppercase tracking-wider text-gray-text">
                  Subtotal
                </p>
                <p className="mt-2 font-medium">
                  {formatPriceFromDecimal(
                    Number(visibleOrder.subtotalAmount ?? 0)
                  )}
                </p>
              </div>

              {Number(visibleOrder.discountAmount ?? 0) > 0 && (
                <div className="rounded border border-border bg-white p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-text">
                    Descuento
                  </p>
                  <p className="mt-2 font-medium text-success">
                    -
                    {formatPriceFromDecimal(
                      Number(visibleOrder.discountAmount ?? 0)
                    )}
                  </p>
                </div>
              )}

              <div className="rounded border border-border bg-white p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-gray-text">
                  Total
                </p>
                <p className="mt-2 font-medium">
                  {formatPriceFromDecimal(Number(visibleOrder.amount ?? 0))}
                </p>
                {visibleOrder.couponCode && (
                  <p className="mt-2 text-xs text-gray-text">
                    Cupón aplicado:{" "}
                    <span className="font-medium">{visibleOrder.couponCode}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-text">
                Historial
              </p>
              {visibleOrder.statusHistory.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-black" />
                    {i < visibleOrder.statusHistory.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">
                      {ORDER_STATUS_LABELS[entry.toStatus as OrderStatusType]}
                    </p>
                    {entry.note && (
                      <p className="mt-0.5 text-xs text-gray-text">
                        {entry.note}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-light">
                      {formatDateAR(entry.createdAt, "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-white p-6">
            <h2 className="mb-4 font-heading text-2xl font-bold tracking-tight">
              Reseñas
            </h2>
            {visibleOrder.status === "DELIVERED" ? (
              <>
                <p className="mb-6 text-sm text-gray-text">
                  Podés dejar una reseña de los productos de este pedido.
                </p>
                {uniqueProducts.length > 0 ? (
                  <div className="space-y-6">
                    {uniqueProducts.map((product) => {
                      const existingReview = reviewsByProductId.get(product.id);
                      return (
                        <div
                          key={product.id}
                          className="rounded border border-border p-4"
                        >
                          <div className="mb-4">
                            <p className="text-sm font-medium">
                              {product.brandName} {product.name}
                            </p>
                          </div>
                          {customerSession &&
                          visibleOrder.customer.id === customerSession.customerId ? (
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
                                Iniciá sesión con la cuenta dueña del pedido para
                                dejar tu reseña.
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
                Las reseñas se pueden dejar una vez que el pedido esté marcado
                como entregado.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
