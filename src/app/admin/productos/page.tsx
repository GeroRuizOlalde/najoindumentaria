import { getProducts } from "@/lib/queries/products";
import { PageHeader } from "@/components/shared/page-header";
import { ProductStatusBadge } from "@/components/shared/status-badge";
import { FormattedPrice } from "@/components/shared/formatted-price";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Package, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ProductStatus } from "@/generated/prisma/client";
import { BulkDeleteButton } from "@/components/admin/bulk-delete-button";
import { deleteAllProducts } from "@/lib/actions/products";

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { products, total, totalPages, currentPage } = await getProducts({
    page: parseInt(params.page || "1"),
    status: params.status as ProductStatus | undefined,
    search: params.search,
  });

  return (
    <>
      <PageHeader
        title="Productos"
        description={`${total} productos en el catálogo`}
        action={
          <div className="flex items-center gap-3">
            <BulkDeleteButton
              action={deleteAllProducts}
              confirmTitle="Eliminar todos los productos"
              confirmDescription="Se eliminarán permanentemente TODOS los productos, sus talles y los pedidos asociados. Esta acción no se puede deshacer."
            />
            <Link
              href="/admin/productos/nuevo"
              className="inline-flex h-10 items-center justify-center bg-black px-5 text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            >
              Nuevo producto
            </Link>
          </div>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="Sin productos"
          description="Creá tu primer producto para empezar a vender."
        />
      ) : (
        <div className="border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Talles</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const availableSizes = product.sizes.filter(
                  (s) => s.isAvailable
                ).length;

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images[0] && (
                          <div className="relative h-10 w-10 overflow-hidden bg-off-white shrink-0">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium flex items-center gap-1.5">
                            {product.name}
                            {product.featured && (
                              <Star className="h-3 w-3 fill-warning text-warning" />
                            )}
                          </p>
                          <p className="text-xs text-gray-text">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.brand.name}</TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>
                      <FormattedPrice
                        price={Number(product.price)}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {availableSizes}/{product.sizes.length}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ProductStatusBadge
                        status={
                          product.status as "DRAFT" | "ACTIVE" | "ARCHIVED"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/productos/${product.id}/editar`}
                        className="text-xs font-medium text-gray-text hover:text-black transition-colors"
                      >
                        Editar
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
