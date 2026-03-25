import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries/orders";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { FormattedPrice } from "@/components/shared/formatted-price";
import { Card, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrderStatusType } from "@/lib/constants";
import { ORDER_STATUS_LABELS, DELIVERY_METHOD_LABELS } from "@/lib/constants";
import type { DeliveryMethodType } from "@/lib/constants";
import { formatDateAR } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { OrderStatusChanger } from "@/components/admin/order-status-changer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={`Pedido ${order.orderCode}`}
        action={
          <StatusBadge status={order.status as OrderStatusType} />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <Card>
            <CardTitle>
              {order.items.length > 0 ? "Productos" : "Producto"}
            </CardTitle>
            <div className="mt-4 space-y-4">
              {order.items.length > 0 ? (
                <>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-text">
                          {item.product.brand.name} &middot; Talle {item.sizeLabel}
                          {item.quantity > 1 && ` x${item.quantity}`}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          minimumFractionDigits: 0,
                        }).format(Number(item.unitPrice) * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-medium">Total</span>
                    <FormattedPrice
                      price={Number(order.amount)}
                      size="lg"
                    />
                  </div>
                </>
              ) : order.product ? (
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{order.product.name}</p>
                    <p className="text-sm text-gray-text">
                      {order.product.brand.name} &middot; Talle {order.sizeLabel}
                    </p>
                    <FormattedPrice
                      price={Number(order.amount)}
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-text">Producto no disponible</p>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <CardTitle>Historial</CardTitle>
            <div className="mt-4 space-y-4">
              {order.statusHistory.map((entry, i) => (
                <div key={entry.id} className="flex gap-3">
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
          </Card>

          {/* Admin notes */}
          {order.adminNotes && (
            <Card>
              <CardTitle>Notas internas</CardTitle>
              <p className="mt-2 text-sm text-gray-text whitespace-pre-wrap">
                {order.adminNotes}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardTitle>Cliente</CardTitle>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-text" />
                <Link
                  href={`/admin/clientes/${order.customerId}`}
                  className="hover:underline"
                >
                  {order.customer.name}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-text" />
                <span>{order.customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-text" />
                <span>{order.customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-text" />
                <span>
                  {order.customer.city}, {order.customer.province}
                </span>
              </div>
            </div>
          </Card>

          {/* Delivery */}
          <Card>
            <CardTitle>Entrega</CardTitle>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-text" />
                <span>
                  {
                    DELIVERY_METHOD_LABELS[
                      order.deliveryMethod as DeliveryMethodType
                    ]
                  }
                </span>
              </div>
              {order.shippingAddress && (
                <p className="text-gray-text">{order.shippingAddress}</p>
              )}
              {order.trackingNumber && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-text" />
                  <span className="font-mono text-xs">
                    {order.trackingNumber}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Dates */}
          <Card>
            <CardTitle>Fechas</CardTitle>
            <div className="mt-4 space-y-2 text-xs text-gray-text">
              <p>
                Creado:{" "}
                {formatDateAR(order.createdAt, "dd/MM/yyyy HH:mm")}
              </p>
              {order.expiresAt && (
                <p>
                  Vence:{" "}
                  {formatDateAR(order.expiresAt, "dd/MM/yyyy HH:mm")}
                </p>
              )}
              {order.paidAt && (
                <p>
                  Pagado:{" "}
                  {formatDateAR(order.paidAt, "dd/MM/yyyy HH:mm")}
                </p>
              )}
              {order.shippedAt && (
                <p>
                  Enviado:{" "}
                  {formatDateAR(order.shippedAt, "dd/MM/yyyy HH:mm")}
                </p>
              )}
            </div>
          </Card>

          {/* Status changer */}
          <Card>
            <OrderStatusChanger
              orderId={order.id}
              currentStatus={order.status as OrderStatusType}
              customerPhone={order.customer.phone}
              customerName={order.customer.name}
              orderCode={order.orderCode}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
