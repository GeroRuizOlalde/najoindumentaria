import { getCustomerFromSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceFromDecimal, formatDateAR } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import type { OrderStatusType } from "@/lib/constants";
import Link from "next/link";
import { LogoutButton } from "@/components/store/logout-button";
import { User, MapPin, ShoppingBag } from "lucide-react";

export default async function AccountPage() {
  const customer = await getCustomerFromSession();
  if (!customer) redirect("/login-cliente");

  const orders = await prisma.order.findMany({
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
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-semibold">Mi cuenta</h1>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
        <div className="border border-border bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
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
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-text" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-text">
              Ubicación
            </h3>
          </div>
          <p className="text-sm">{customer.city}, {customer.province}</p>
          <Link
            href="/cuenta/direcciones"
            className="text-xs underline mt-2 inline-block"
          >
            Gestionar direcciones ({customer.addresses.length})
          </Link>
        </div>

        <div className="border border-border bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="h-4 w-4 text-gray-text" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-text">
              Pedidos
            </h3>
          </div>
          <p className="text-2xl font-heading font-semibold">{orders.length}</p>
          <p className="text-xs text-gray-text">pedidos realizados</p>
        </div>
      </div>

      <h2 className="font-heading text-lg font-semibold mb-4">
        Mis pedidos
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-text border border-border bg-white">
          Todavía no tenés pedidos.
        </div>
      ) : (
        <div className="border border-border bg-white divide-y divide-border">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/seguimiento?codigo=${order.orderCode}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-off-white/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{order.orderCode}</p>
                <p className="text-xs text-gray-text">
                  {order.items.length > 0
                    ? order.items.map((i) => i.product.name).join(", ")
                    : order.product?.name || "—"}{" "}
                  &middot; Talle{" "}
                  {order.items.length > 0
                    ? order.items.map((i) => i.sizeLabel).join(", ")
                    : order.sizeLabel || "—"}
                </p>
                <p className="text-xs text-gray-text mt-0.5">
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
