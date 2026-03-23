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
import { FolderOpen } from "lucide-react";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Gestioná las categorías de tu catálogo"
        action={
          <Link
            href="/admin/categorias?new=true"
            className="inline-flex h-10 items-center justify-center bg-black px-5 text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            Nueva categoría
          </Link>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-12 w-12" />}
          title="Sin categorías"
          description="Creá tu primera categoría para empezar a cargar productos."
        />
      ) : (
        <div className="border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Orden</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-gray-text">{cat.slug}</TableCell>
                  <TableCell>{cat._count.products}</TableCell>
                  <TableCell>
                    <Badge variant={cat.active ? "success" : "secondary"}>
                      {cat.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>{cat.sortOrder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
