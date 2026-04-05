import Link from "next/link";
import { Users } from "lucide-react";
import { getCustomers } from "@/lib/queries/customers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDateAR } from "@/lib/utils";
import { BulkDeleteButton } from "@/components/admin/bulk-delete-button";
import { deleteAllCustomers } from "@/lib/actions/customers";
import {
  hasAdminPermission,
  requireAdminPermission,
} from "@/lib/admin-permissions";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { Pagination } from "@/components/ui/pagination";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CustomersPage({ searchParams }: Props) {
  const session = await requireAdminPermission("customers.view");
  const canManage = hasAdminPermission(session.user.role, "customers.manage");
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");

  const { customers, total, totalPages } = await getCustomers({
    page: currentPage,
    search: params.search,
  });

  const paginationParams: Record<string, string> = {};
  if (params.search) paginationParams.search = params.search;

  return (
    <>
      <PageHeader
        title="Clientes"
        description={`${total} clientes registrados`}
        action={
          canManage ? (
            <BulkDeleteButton
              action={deleteAllCustomers}
              confirmTitle="Eliminar todos los clientes"
              confirmDescription="Se eliminaran permanentemente TODOS los clientes y sus pedidos asociados. Esta accion no se puede deshacer."
            />
          ) : null
        }
      />

      <ListToolbar
        search={params.search}
        placeholder="Buscar por nombre, email o telefono"
        resetHref="/admin/clientes"
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Sin clientes"
          description="Los clientes se crean automaticamente cuando hacen su primera reserva."
        />
      ) : (
        <>
          <div className="border border-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Ubicacion</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Ultimo pedido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link
                        href={`/admin/clientes/${customer.id}`}
                        className="font-medium hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-text">
                      {customer.email}
                    </TableCell>
                    <TableCell className="text-gray-text">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="text-gray-text text-xs">
                      {customer.city}, {customer.province}
                    </TableCell>
                    <TableCell>{customer._count.orders}</TableCell>
                    <TableCell className="text-xs text-gray-text">
                      {customer.orders[0]
                        ? formatDateAR(customer.orders[0].createdAt, "dd/MM/yy")
                        : "-"}
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
              basePath="/admin/clientes"
              searchParams={paginationParams}
            />
          </div>
        </>
      )}
    </>
  );
}
