import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getOrders } from "@/lib/queries/orders";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatPriceFromDecimal, formatDateAR } from "@/lib/utils";
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
import { ArchiveOrderButton } from "@/components/admin/archive-order-button";
import { requireAdminPermission } from "@/lib/admin-permissions";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { Pagination } from "@/components/ui/pagination";

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    archived?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  await requireAdminPermission("orders.view");
  const params = await searchParams;
  const isArchived = params.archived === "true";

  const { orders, total, totalPages, currentPage } = await getOrders({
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

  const paginationParams: Record<string, string> = {};
  if (params.status) paginationParams.status = params.status;
  if (params.search) paginationParams.search = params.search;
  if (params.archived) paginationParams.archived = params.archived;

  return (
    <>
      <PageHeader title="Pedidos" description={`${total} pedidos en total`} />

      <div className="mb-6 flex gap-1 overflow-x-auto">
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

      <ListToolbar
        search={params.search}
        placeholder="Buscar por codigo o cliente"
        resetHref={
          isArchived
            ? "/admin/pedidos?archived=true"
            : params.status
              ? `/admin/pedidos?status=${params.status}`
              : "/admin/pedidos"
        }
        hiddenFields={{
          status: params.status,
          archived: params.archived,
        }}
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="Sin pedidos"
          description="Los pedidos apareceran aca cuando los clientes hagan reservas."
        />
      ) : (
        <>
          <div className="border border-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
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
                            {order.items.length > 1 &&
                              ` +${order.items.length - 1} mas`}
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
                        <p className="text-xs text-gray-text">-</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.items.length > 0
                        ? order.items.map((item) => item.sizeLabel).join(", ")
                        : order.sizeLabel || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPriceFromDecimal(Number(order.amount))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status as OrderStatusType} />
                    </TableCell>
                    <TableCell className="text-xs text-gray-text">
                      {formatDateAR(order.createdAt, "dd/MM/yy HH:mm")}
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

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/admin/pedidos"
              searchParams={paginationParams}
            />
          </div>
        </>
      )}
    </>
  );
}
