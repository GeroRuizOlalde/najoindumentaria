import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { getCategories } from "@/lib/queries/categories";
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
  deleteAllCategories,
  deleteCategory,
  toggleCategoryActive,
} from "@/lib/actions/categories";
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

export default async function CategoriesPage({ searchParams }: Props) {
  const session = await requireAdminPermission("categories.view");
  const canManage = hasAdminPermission(session.user.role, "categories.manage");
  const params = await searchParams;

  const { categories, total, currentPage, totalPages } = await getCategories({
    page: parseInt(params.page || "1"),
    search: params.search,
  });

  const paginationParams: Record<string, string> = {};
  if (params.search) paginationParams.search = params.search;

  return (
    <>
      <PageHeader
        title="Categorias"
        description={`${total} categorias cargadas`}
        action={
          canManage ? (
            <div className="flex items-center gap-3">
              <BulkDeleteButton
                action={deleteAllCategories}
                confirmTitle="Eliminar todas las categorias"
                confirmDescription="Se eliminarán permanentemente TODAS las categorías, sus productos asociados y los pedidos relacionados. Esta acción no se puede deshacer."
              />
              <Link
                href="/admin/categorias/nueva"
                className="inline-flex h-10 items-center justify-center bg-black px-5 text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              >
                Nueva categoria
              </Link>
            </div>
          ) : null
        }
      />

      <ListToolbar
        search={params.search}
        placeholder="Buscar por nombre o slug"
        resetHref="/admin/categorias"
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-12 w-12" />}
          title="Sin categorias"
          description="Creá tu primera categoría para empezar a cargar productos."
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
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-gray-text">
                      {category.slug}
                    </TableCell>
                    <TableCell>{category._count.products}</TableCell>
                    <TableCell>
                      <Badge
                        variant={category.active ? "success" : "secondary"}
                      >
                        {category.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>{category.sortOrder}</TableCell>
                    <TableCell>
                      <EntityRowActions
                        editHref={`/admin/categorias/${category.id}/editar`}
                        isActive={category.active}
                        canManage={canManage}
                        entityName={category.name}
                        toggleLabel={{
                          active: "Desactivar",
                          inactive: "Activar",
                        }}
                        onToggle={toggleCategoryActive.bind(null, category.id)}
                        onDelete={deleteCategory.bind(null, category.id)}
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
              basePath="/admin/categorias"
              searchParams={paginationParams}
            />
          </div>
        </>
      )}
    </>
  );
}
