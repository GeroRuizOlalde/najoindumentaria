import { getProducts } from "@/lib/queries/products";
import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveBrands } from "@/lib/queries/brands";
import { PageHeader } from "@/components/shared/page-header";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { ProductGrid } from "@/components/store/product-grid";

interface Props {
  searchParams: Promise<{
    page?: string;
    categoria?: string;
    marca?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");

  const [result, categories, brands] = await Promise.all([
    getProducts({
      page,
      status: "ACTIVE",
      categorySlug: params.categoria,
      brandSlug: params.marca,
      search: params.search,
      sort: params.sort,
    }),
    getActiveCategories(),
    getActiveBrands(),
  ]);

  const qsEntries: Record<string, string> = {};
  if (params.categoria) qsEntries.categoria = params.categoria;
  if (params.marca) qsEntries.marca = params.marca;
  if (params.search) qsEntries.search = params.search;
  if (params.sort) qsEntries.sort = params.sort;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <PageHeader
        title="Catálogo"
        description={`${result.total} producto${result.total !== 1 ? "s" : ""}`}
      />

      <CatalogFilters categories={categories} brands={brands} />

      <ProductGrid
        products={result.products}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        baseUrl="/shop"
        searchParams={qsEntries}
      />
    </div>
  );
}
