import Link from "next/link";
import { TicketPercent } from "lucide-react";
import { getCoupons } from "@/lib/queries/coupons";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  hasAdminPermission,
  requireAdminPermission,
} from "@/lib/admin-permissions";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EntityRowActions } from "@/components/admin/entity-row-actions";
import {
  deleteCoupon,
  toggleCouponActive,
} from "@/lib/actions/coupons";

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    active?: string;
  }>;
}

export default async function CouponsPage({ searchParams }: Props) {
  const session = await requireAdminPermission("coupons.view");
  const canManage = hasAdminPermission(session.user.role, "coupons.manage");
  const params = await searchParams;

  const activeFilter =
    params.active === "true" ? true : params.active === "false" ? false : undefined;

  const { coupons, total, currentPage, totalPages } = await getCoupons({
    page: parseInt(params.page || "1"),
    search: params.search,
    active: activeFilter,
  });

  const paginationParams: Record<string, string> = {};
  if (params.search) paginationParams.search = params.search;
  if (params.active) paginationParams.active = params.active;

  return (
    <>
      <PageHeader
        title="Cupones"
        description={`${total} cupones configurados`}
        action={
          canManage ? (
            <Link
              href="/admin/cupones/nuevo"
              className="inline-flex h-10 items-center justify-center bg-black px-5 text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            >
              Nuevo cupon
            </Link>
          ) : null
        }
      />

      <ListToolbar
        search={params.search}
        placeholder="Buscar por codigo o descripcion"
        resetHref={params.active ? `/admin/cupones?active=${params.active}` : "/admin/cupones"}
        hiddenFields={{ active: params.active }}
      >
        <div className="flex gap-2">
          <Link
            href="/admin/cupones"
            className={`inline-flex h-10 items-center justify-center border px-4 text-xs uppercase tracking-wider transition-colors ${
              !params.active
                ? "border-black bg-black text-white"
                : "border-border bg-white text-gray-text hover:text-black"
            }`}
          >
            Todos
          </Link>
          <Link
            href="/admin/cupones?active=true"
            className={`inline-flex h-10 items-center justify-center border px-4 text-xs uppercase tracking-wider transition-colors ${
              params.active === "true"
                ? "border-black bg-black text-white"
                : "border-border bg-white text-gray-text hover:text-black"
            }`}
          >
            Activos
          </Link>
          <Link
            href="/admin/cupones?active=false"
            className={`inline-flex h-10 items-center justify-center border px-4 text-xs uppercase tracking-wider transition-colors ${
              params.active === "false"
                ? "border-black bg-black text-white"
                : "border-border bg-white text-gray-text hover:text-black"
            }`}
          >
            Inactivos
          </Link>
        </div>
      </ListToolbar>

      {coupons.length === 0 ? (
        <EmptyState
          icon={<TicketPercent className="h-12 w-12" />}
          title="Sin cupones"
          description="Crea descuentos para campañas, promociones o ventas especiales."
        />
      ) : (
        <>
          <div className="border border-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Condiciones</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{coupon.code}</p>
                        {coupon.description && (
                          <p className="text-xs text-gray-text">{coupon.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.discountType === "PERCENTAGE"
                        ? `${Number(coupon.value)}%`
                        : `$${Number(coupon.value)}`}
                    </TableCell>
                    <TableCell className="text-xs text-gray-text">
                      <p>
                        Min:{" "}
                        {coupon.minAmount ? `$${Number(coupon.minAmount)}` : "-"}
                      </p>
                      <p>
                        Tope:{" "}
                        {coupon.maxDiscount
                          ? `$${Number(coupon.maxDiscount)}`
                          : "-"}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">
                      <p>{coupon.usedCount} usos</p>
                      <p className="text-gray-text">
                        {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "/ ilimitado"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.active ? "success" : "secondary"}>
                        {coupon.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <EntityRowActions
                        editHref={`/admin/cupones/${coupon.id}/editar`}
                        isActive={coupon.active}
                        canManage={canManage}
                        entityName={coupon.code}
                        toggleLabel={{
                          active: "Desactivar",
                          inactive: "Activar",
                        }}
                        onToggle={() => toggleCouponActive(coupon.id)}
                        onDelete={() => deleteCoupon(coupon.id)}
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
              basePath="/admin/cupones"
              searchParams={paginationParams}
            />
          </div>
        </>
      )}
    </>
  );
}
