import { getOrders } from "@/lib/queries/orders";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatPriceFromDecimal } from "@/lib/utils";
import type { OrderStatusType } from "@/lib/constants";
import type { OrderStatus } from "@/generated/prisma/client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ShoppingBag, Archive } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArchiveOrderButton } from "@/components/admin/archive-order-button";

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    archived?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const isArchived = params.archived === "true";
  const { orders, total } = await getOrders({
    page: parseInt(params.page || "1"),
    status: params.status as OrderStatus | undefined,
    search: params.search,
    archived: isArchived,
  });

  const statusTabs = [
    { value: "", label: "Todos" },
    { value: "PENDING", label: "Pendientes" },
    { value: "PAYMENT_RECEIVED", label: "Pago recibido" },
    { value: "CONFIRMED", label: "Confirmados" },
    { value: "PREPARING", label: "Preparando" },
    { value: "SHIPPED", label: "Enviados" },
    { value: "DELIVERED", label: "Entregados" },
    { value: "ARCHIVED", label: "Archivados" },
  ];

  return (
    <>
      <PageHeader
        title="Pedidos"
        description={`${total} pedidos en total`}
      />

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {statusTabs.map((tab) => {
          const isArchivedTab = tab.value === "ARCHIVED";
          const href = isArchivedTab
            ? "/admin/pedidos?archived=true"
            : tab.value
              ? `/admin/pedidos?status=${tab.value}`
              : "/admin/pedidos";
          const isActive = isArchivedTab
            ? isArchived
            : !isArchived && (params.status || "") === tab.value;

          return (
            <Link
              key={tab.value}
              href={href}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "bg-off-white text-gray-text hover:text-black"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="Sin pedidos"
          description="Los pedidos aparecerán acá cuando los clientes hagan reservas."
        />
      ) : (
        <div className="border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Talle</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="font-medium text-black hover:underline"
                    >
                      {order.orderCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{order.customer.name}</p>
                      <p className="text-xs text-gray-text">
                        {order.customer.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.items.length > 0 ? (
                      <div>
                        <p className="text-sm">{order.items[0].product.name}</p>
                        <p className="text-xs text-gray-text">
                          {order.items[0].product.brand.name}
                          {order.items.length > 1 && ` +${order.items.length - 1} más`}
                        </p>
                      </div>
                    ) : order.product ? (
                      <div>
                        <p className="text-sm">{order.product.name}</p>
                        <p className="text-xs text-gray-text">
                          {order.product.brand.name}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-text">—</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.items.length > 0
                      ? order.items.map((i) => i.sizeLabel).join(", ")
                      : order.sizeLabel || "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPriceFromDecimal(Number(order.amount))}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={order.status as OrderStatusType}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-gray-text">
                    {format(new Date(order.createdAt), "dd/MM/yy HH:mm", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>
                    <ArchiveOrderButton
                      orderId={order.id}
                      isArchived={!!order.archivedAt}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
