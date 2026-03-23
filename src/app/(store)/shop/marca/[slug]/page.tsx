import { notFound } from "next/navigation";
import { getProducts } from "@/lib/queries/products";
import { getBrandBySlug } from "@/lib/queries/brands";
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
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: brand.name,
    description: `Comprá ${brand.name} en Najo Indumentaria. Productos originales con garantía.`,
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const page = parseInt(sp.page || "1");

  const [result, categories, brands] = await Promise.all([
    getProducts({ page, status: "ACTIVE", brandSlug: slug, sort: sp.sort }),
    getActiveCategories(),
    getActiveBrands(),
  ]);

  const qsEntries: Record<string, string> = {};
  if (sp.sort) qsEntries.sort = sp.sort;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <PageHeader
        title={brand.name}
        description={`${result.total} producto${result.total !== 1 ? "s" : ""}`}
      />

      <CatalogFilters categories={categories} brands={brands} />

      <ProductGrid
        products={result.products}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        baseUrl={`/shop/marca/${slug}`}
        searchParams={qsEntries}
      />
    </div>
  );
}
