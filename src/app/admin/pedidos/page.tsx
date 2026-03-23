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
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { orders, total } = await getOrders({
    page: parseInt(params.page || "1"),
    status: params.status as OrderStatus | undefined,
    search: params.search,
  });

  const statusTabs = [
    { value: "", label: "Todos" },
    { value: "PENDING", label: "Pendientes" },
    { value: "PAYMENT_RECEIVED", label: "Pago recibido" },
    { value: "CONFIRMED", label: "Confirmados" },
    { value: "PREPARING", label: "Preparando" },
    { value: "SHIPPED", label: "Enviados" },
    { value: "DELIVERED", label: "Entregados" },
  ];

  return (
    <>
      <PageHeader
        title="Pedidos"
        description={`${total} pedidos en total`}
      />

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value
                ? `/admin/pedidos?status=${tab.value}`
                : "/admin/pedidos"
            }
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              (params.status || "") === tab.value
                ? "bg-black text-white"
                : "bg-off-white text-gray-text hover:text-black"
            }`}
          >
            {tab.label}
          </Link>
        ))}
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
                    <p className="text-sm">{order.product.name}</p>
                    <p className="text-xs text-gray-text">
                      {order.product.brand.name}
                    </p>
                  </TableCell>
                  <TableCell>{order.sizeLabel}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
