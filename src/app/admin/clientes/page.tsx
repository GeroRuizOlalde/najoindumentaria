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
import { Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CustomersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { customers, total } = await getCustomers({
    page: parseInt(params.page || "1"),
    search: params.search,
  });

  return (
    <>
      <PageHeader
        title="Clientes"
        description={`${total} clientes registrados`}
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Sin clientes"
          description="Los clientes se crean automáticamente cuando hacen su primera reserva."
        />
      ) : (
        <div className="border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Último pedido</TableHead>
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
                      ? format(
                          new Date(customer.orders[0].createdAt),
                          "dd/MM/yy",
                          { locale: es }
                        )
                      : "—"}
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
