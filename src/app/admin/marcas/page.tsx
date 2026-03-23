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
import { Tags } from "lucide-react";
import Link from "next/link";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <>
      <PageHeader
        title="Marcas"
        description="Gestioná las marcas de tu catálogo"
        action={
          <Link
            href="/admin/marcas?new=true"
            className="inline-flex h-10 items-center justify-center bg-black px-5 text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            Nueva marca
          </Link>
        }
      />

      {brands.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-12 w-12" />}
          title="Sin marcas"
          description="Creá tu primera marca para empezar a cargar productos."
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
