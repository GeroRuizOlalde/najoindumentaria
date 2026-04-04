import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { getCustomerById } from "@/lib/queries/customers";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardTitle } from "@/components/ui/card";
import { formatPriceFromDecimal, formatDateAR } from "@/lib/utils";
import type { OrderStatusType } from "@/lib/constants";
import { requireAdminPermission } from "@/lib/admin-permissions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  await requireAdminPermission("customers.view");
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  const totalSpent = customer.orders
    .filter((order) =>
      ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].includes(order.status)
    )
    .reduce((sum, order) => sum + Number(order.amount), 0);

  return (
    <>
      <PageHeader title={customer.name} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>Contacto</CardTitle>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-text" />
              {customer.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-text" />
              {customer.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-text" />
              {customer.city}, {customer.province}
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4 text-sm">
            <p>
              Pedidos: <strong>{customer.orders.length}</strong>
            </p>
            <p>
              Gastado: <strong>{formatPriceFromDecimal(totalSpent)}</strong>
            </p>
          </div>

          {customer.notes && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-gray-text">Notas:</p>
              <p className="mt-1 text-sm">{customer.notes}</p>
            </div>
          )}
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardTitle>Historial de pedidos</CardTitle>
            <div className="mt-4 divide-y divide-border">
              {customer.orders.length === 0 ? (
                <p className="py-4 text-sm text-gray-text">Sin pedidos.</p>
              ) : (
                customer.orders.map((order) => {
                  const orderSummary =
                    order.items.length > 0
                      ? order.items
                          .map(
                            (item) =>
                              `${item.product.brand.name} ${item.product.name} (${item.sizeLabel})`
                          )
                          .join(", ")
                      : `${order.product?.brand?.name || ""} ${order.product?.name || "Pedido"} (${order.sizeLabel || "-"})`;

                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {order.orderCode}
                        </Link>
                        <p className="text-xs text-gray-text">{orderSummary}</p>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-sm font-medium">
                            {formatPriceFromDecimal(Number(order.amount))}
                          </p>
                          <p className="text-xs text-gray-text">
                            {formatDateAR(order.createdAt, "dd/MM/yy")}
                          </p>
                        </div>
                        <StatusBadge status={order.status as OrderStatusType} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
