import { notFound } from "next/navigation";
import { getProducts } from "@/lib/queries/products";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveBrands } from "@/lib/queries/brands";
import { PageHeader } from "@/components/shared/page-header";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { ProductGrid } from "@/components/store/product-grid";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `Comprá ${category.name} en Najo Indumentaria. Las mejores marcas streetwear.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = parseInt(sp.page || "1");

  const [result, categories, brands] = await Promise.all([
    getProducts({ page, status: "ACTIVE", categorySlug: slug, sort: sp.sort }),
    getActiveCategories(),
    getActiveBrands(),
  ]);

  const qsEntries: Record<string, string> = {};
  if (sp.sort) qsEntries.sort = sp.sort;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <PageHeader
        title={category.name}
        description={`${result.total} producto${result.total !== 1 ? "s" : ""}`}
      />

      <CatalogFilters categories={categories} brands={brands} />

      <ProductGrid
        products={result.products}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        baseUrl={`/shop/categoria/${slug}`}
        searchParams={qsEntries}
      />
    </div>
  );
}
