import Link from "next/link";
import { redirect } from "next/navigation";
import { User, MapPin, ShoppingBag, Heart, MessageSquareQuote } from "lucide-react";
import { getCustomerFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { formatPriceFromDecimal, formatDateAR } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import type { OrderStatusType } from "@/lib/constants";
import { LogoutButton } from "@/components/store/logout-button";
import { ProductCard } from "@/components/store/product-card";

export default async function AccountPage() {
  const customer = await getCustomerFromSession();
  if (!customer) redirect("/login-cliente");

  const [orders, wishlistItems, reviews] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, brand: { select: { name: true } } } },
        items: {
          include: {
            product: { select: { name: true, brand: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.wishlistItem.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: {
            brand: { select: { name: true } },
            sizes: {
              where: { isAvailable: true, stock: { gt: 0 } },
              select: { sizeLabel: true },
            },
          },
        },
      },
    }),
    prisma.review.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Mi cuenta</h1>
        <LogoutButton />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-text" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-text">
              Datos personales
            </h3>
          </div>
          <p className="text-sm font-medium">{customer.name}</p>
          <p className="text-xs text-gray-text">{customer.email}</p>
          <p className="text-xs text-gray-text">{customer.phone}</p>
        </div>

        <div className="border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-text" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-text">
              Ubicacion
            </h3>
          </div>
          <p className="text-sm">
            {customer.city}, {customer.province}
          </p>
          <Link href="/cuenta/direcciones" className="mt-2 inline-block text-xs underline">
            Gestionar direcciones ({customer.addresses.length})
          </Link>
        </div>

        <div className="border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-gray-text" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-text">
              Pedidos
            </h3>
          </div>
          <p className="font-heading text-2xl font-semibold">{orders.length}</p>
          <p className="text-xs text-gray-text">pedidos realizados</p>
        </div>

        <div className="border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-gray-text" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-text">
              Favoritos
            </h3>
          </div>
          <p className="font-heading text-2xl font-semibold">{wishlistItems.length}</p>
          <p className="text-xs text-gray-text">productos guardados</p>
        </div>
      </div>

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Heart className="h-4 w-4 text-gray-text" />
          <h2 className="font-heading text-lg font-semibold">Mis favoritos</h2>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="border border-border bg-white py-12 text-center text-sm text-gray-text">
            Todavia no guardaste productos en favoritos.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
            {wishlistItems.map((item) => (
              <ProductCard key={item.id} product={item.product} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquareQuote className="h-4 w-4 text-gray-text" />
          <h2 className="font-heading text-lg font-semibold">Mis reseñas</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="border border-border bg-white py-12 text-center text-sm text-gray-text">
            Aun no dejaste reseñas.
          </div>
        ) : (
          <div className="divide-y divide-border border border-border bg-white">
            {reviews.map((review) => (
              <div key={review.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <Link href={`/producto/${review.product.slug}`} className="font-medium hover:underline">
                    {review.product.name}
                  </Link>
                  <span className="text-xs uppercase tracking-wider text-gray-text">
                    {review.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-text">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>
                {review.title && <p className="mt-2 text-sm font-medium">{review.title}</p>}
                <p className="mt-1 text-sm text-gray-text">{review.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <h2 className="mb-4 font-heading text-lg font-semibold">Mis pedidos</h2>

      {orders.length === 0 ? (
        <div className="border border-border bg-white py-12 text-center text-sm text-gray-text">
          Todavia no tenes pedidos.
        </div>
      ) : (
        <div className="divide-y divide-border border border-border bg-white">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/seguimiento?codigo=${order.orderCode}`}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-off-white/50"
            >
              <div>
                <p className="text-sm font-medium">{order.orderCode}</p>
                <p className="text-xs text-gray-text">
                  {order.items.length > 0
                    ? order.items.map((item) => item.product.name).join(", ")
                    : order.product?.name || "-"}{" "}
                  · Talle{" "}
                  {order.items.length > 0
                    ? order.items.map((item) => item.sizeLabel).join(", ")
                    : order.sizeLabel || "-"}
                </p>
                <p className="mt-0.5 text-xs text-gray-text">
                  {formatDateAR(order.createdAt, "dd/MM/yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {formatPriceFromDecimal(Number(order.amount))}
                </span>
                <StatusBadge status={order.status as OrderStatusType} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
