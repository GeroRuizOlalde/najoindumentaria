import Link from "next/link";
import { Tags } from "lucide-react";
import { getBrands } from "@/lib/queries/brands";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { BulkDeleteButton } from "@/components/admin/bulk-delete-button";
import {
  deleteAllBrands,
  deleteBrand,
  toggleBrandActive,
} from "@/lib/actions/brands";
import {
  hasAdminPermission,
  requireAdminPermission,
} from "@/lib/admin-permissions";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { EntityRowActions } from "@/components/admin/entity-row-actions";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function BrandsPage({ searchParams }: Props) {
  const session = await requireAdminPermission("brands.view");
  const canManage = hasAdminPermission(session.user.role, "brands.manage");
  const params = await searchParams;

  const { brands, total, currentPage, totalPages } = await getBrands({
    page: parseInt(params.page || "1"),
    search: params.search,
  });

  const paginationParams: Record<string, string> = {};
  if (params.search) paginationParams.search = params.search;

  return (
    <>
      <PageHeader
        title="Marcas"
        description={`${total} marcas cargadas`}
        action={
          canManage ? (
            <div className="flex items-center gap-3">
              <BulkDeleteButton
                action={deleteAllBrands}
                confirmTitle="Eliminar todas las marcas"
                confirmDescription="Se eliminarán permanentemente TODAS las marcas, sus productos asociados y los pedidos relacionados. Esta acción no se puede deshacer."
              />
              <Link
                href="/admin/marcas/nueva"
                className="inline-flex h-10 items-center justify-center bg-black px-5 text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              >
                Nueva marca
              </Link>
            </div>
          ) : null
        }
      />

      <ListToolbar
        search={params.search}
        placeholder="Buscar por nombre o slug"
        resetHref="/admin/marcas"
      />

      {brands.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-12 w-12" />}
          title="Sin marcas"
          description="Creá tu primera marca para empezar a cargar productos."
        />
      ) : (
        <>
          <div className="border border-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="text-gray-text">{brand.slug}</TableCell>
                    <TableCell>{brand._count.products}</TableCell>
                    <TableCell>
                      <Badge variant={brand.active ? "success" : "secondary"}>
                        {brand.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>{brand.sortOrder}</TableCell>
                    <TableCell>
                      <EntityRowActions
                        editHref={`/admin/marcas/${brand.id}/editar`}
                        isActive={brand.active}
                        canManage={canManage}
                        entityName={brand.name}
                        toggleLabel={{
                          active: "Desactivar",
                          inactive: "Activar",
                        }}
                        onToggle={toggleBrandActive.bind(null, brand.id)}
                        onDelete={deleteBrand.bind(null, brand.id)}
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
              basePath="/admin/marcas"
              searchParams={paginationParams}
            />
          </div>
        </>
      )}
    </>
  );
}
