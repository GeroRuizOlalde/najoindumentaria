import { notFound } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Truck,
  Receipt,
  CreditCard,
} from "lucide-react";
import { getOrderById } from "@/lib/queries/orders";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { FormattedPrice } from "@/components/shared/formatted-price";
import { Card, CardTitle } from "@/components/ui/card";
import { OrderStatusChanger } from "@/components/admin/order-status-changer";
import { OrderDetailsForm } from "@/components/admin/order-details-form";
import { formatDateAR } from "@/lib/utils";
import {
  DELIVERY_METHOD_LABELS,
  ORDER_STATUS_LABELS,
  type DeliveryMethodType,
  type OrderStatusType,
} from "@/lib/constants";
import {
  hasAdminPermission,
  requireAdminPermission,
} from "@/lib/admin-permissions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await requireAdminPermission("orders.view");
  const canManage = hasAdminPermission(session.user.role, "orders.manage");
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const items: {
    id: string;
    quantity: number;
    sizeLabel: string;
    unitPrice: number | typeof order.amount;
    product: {
      name: string;
      slug?: string;
      brand: { name: string };
    };
  }[] =
    order.items.length > 0
      ? order.items
      : order.product
        ? [
            {
              id: order.id,
              product: {
                name: order.product.name,
                slug: order.product.slug,
                brand: { name: order.product.brand.name },
              },
              quantity: 1,
              sizeLabel: order.sizeLabel || "-",
              unitPrice: order.amount,
            },
          ]
        : [];

  return (
    <>
      <PageHeader
        title={`Pedido ${order.orderCode}`}
        action={<StatusBadge status={order.status as OrderStatusType} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle>{items.length > 1 ? "Productos" : "Producto"}</CardTitle>
            <div className="mt-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-gray-text">Producto no disponible.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
                  >
                    <div>
                      {item.product.slug ? (
                        <Link
                          href={`/producto/${item.product.slug}`}
                          className="font-medium hover:underline"
                        >
                          {item.product.name}
                        </Link>
                      ) : (
                        <p className="font-medium">{item.product.name}</p>
                      )}
                      <p className="text-sm text-gray-text">
                        {item.product.brand.name} · Talle {item.sizeLabel}
                        {item.quantity > 1 ? ` x${item.quantity}` : ""}
                      </p>
                    </div>
                    <FormattedPrice
                      price={Number(item.unitPrice) * item.quantity}
                      size="sm"
                    />
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Resumen comercial</CardTitle>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-text">Subtotal</span>
                <FormattedPrice
                  price={Number(order.subtotalAmount ?? order.amount)}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-text">Descuento</span>
                <FormattedPrice price={Number(order.discountAmount)} size="sm" />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-medium">Total</span>
                <FormattedPrice price={Number(order.amount)} size="lg" />
              </div>

              {order.couponCode && (
                <div className="rounded border border-border bg-off-white p-3 text-xs text-gray-text">
                  <p className="font-medium text-black">Cupon aplicado</p>
                  <p>{order.couponCode}</p>
                  {order.coupon?.description && <p>{order.coupon.description}</p>}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Historial</CardTitle>
            <div className="mt-4 space-y-4">
              {order.statusHistory.map((entry, index) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-black" />
                    {index < order.statusHistory.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">
                      {ORDER_STATUS_LABELS[entry.toStatus as OrderStatusType]}
                    </p>
                    {entry.note && (
                      <p className="mt-0.5 text-xs text-gray-text">{entry.note}</p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-light">
                      {formatDateAR(entry.createdAt, "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Cliente</CardTitle>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-text" />
                <Link href={`/admin/clientes/${order.customerId}`} className="hover:underline">
                  {order.customer.name}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-text" />
                <span>{order.customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-text" />
                <span>{order.customer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-text" />
                <span>
                  {order.customer.city}, {order.customer.province}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Entrega y pago</CardTitle>
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
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-text" />
                  <span className="text-gray-text">{order.shippingAddress}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-text" />
                  <span className="font-mono text-xs">{order.trackingNumber}</span>
                </div>
              )}
              {order.paymentProof && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-text" />
                  <a
                    href={order.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium hover:underline"
                  >
                    Ver comprobante
                  </a>
                </div>
              )}
              {order.couponCode && (
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gray-text" />
                  <span className="text-xs">Cupon: {order.couponCode}</span>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Fechas</CardTitle>
            <div className="mt-4 space-y-2 text-xs text-gray-text">
              <p>Creado: {formatDateAR(order.createdAt, "dd/MM/yyyy HH:mm")}</p>
              <p>Vence: {formatDateAR(order.expiresAt, "dd/MM/yyyy HH:mm")}</p>
              {order.paidAt && (
                <p>Pago recibido: {formatDateAR(order.paidAt, "dd/MM/yyyy HH:mm")}</p>
              )}
              {order.confirmedAt && (
                <p>Confirmado: {formatDateAR(order.confirmedAt, "dd/MM/yyyy HH:mm")}</p>
              )}
              {order.shippedAt && (
                <p>Enviado: {formatDateAR(order.shippedAt, "dd/MM/yyyy HH:mm")}</p>
              )}
              {order.deliveredAt && (
                <p>Entregado: {formatDateAR(order.deliveredAt, "dd/MM/yyyy HH:mm")}</p>
              )}
            </div>
          </Card>

          {canManage && (
            <>
              <Card>
                <OrderStatusChanger
                  orderId={order.id}
                  currentStatus={order.status as OrderStatusType}
                  customerPhone={order.customer.phone}
                  customerName={order.customer.name}
                  orderCode={order.orderCode}
                />
              </Card>

              <Card>
                <CardTitle>Gestion del pedido</CardTitle>
                <div className="mt-4">
                  <OrderDetailsForm
                    orderId={order.id}
                    trackingNumber={order.trackingNumber}
                    shippingAddress={order.shippingAddress}
                    paymentProof={order.paymentProof}
                    adminNotes={order.adminNotes}
                  />
                </div>
              </Card>
            </>
          )}

          {!canManage && order.adminNotes && (
            <Card>
              <CardTitle>Notas internas</CardTitle>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-text">
                {order.adminNotes}
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
