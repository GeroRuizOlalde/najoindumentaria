import type { Metadata } from "next";
import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveBrands } from "@/lib/queries/brands";
import {
  getAvailableSizeLabels,
  getProducts,
} from "@/lib/queries/products";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { ProductGrid } from "@/components/store/product-grid";

interface Props {
  searchParams: Promise<{
    page?: string;
    categoria?: string;
    marca?: string;
    talle?: string;
    search?: string;
    sort?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Sale",
  description:
    "Descubrí productos en promoción con stock disponible en Najo Indumentaria.",
};

export default async function SalePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");

  const [result, categories, brands, sizeOptions] = await Promise.all([
    getProducts({
      page,
      status: "ACTIVE",
      onSaleOnly: true,
      categorySlug: params.categoria,
      brandSlug: params.marca,
      sizeLabel: params.talle,
      search: params.search,
      sort: params.sort,
      availableSizesOnly: true,
    }),
    getActiveCategories(),
    getActiveBrands(),
    getAvailableSizeLabels({ onSaleOnly: true }),
  ]);

  const qsEntries: Record<string, string> = {};
  if (params.categoria) qsEntries.categoria = params.categoria;
  if (params.marca) qsEntries.marca = params.marca;
  if (params.talle) qsEntries.talle = params.talle;
  if (params.search) qsEntries.search = params.search;
  if (params.sort) qsEntries.sort = params.sort;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <CatalogFilters
        categories={categories}
        brands={brands}
        sizeOptions={sizeOptions}
        showSizeFilter
        categoryLabel="Todos los tipos"
      />

      <ProductGrid
        products={result.products}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        baseUrl="/sale"
        searchParams={qsEntries}
      />
    </div>
  );
}
