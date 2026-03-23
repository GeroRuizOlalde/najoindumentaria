import { ProductCard } from "@/components/store/product-card";
import { Pagination } from "@/components/ui/pagination";

interface ProductGridProps {
  products: {
    slug: string;
    name: string;
    images: string[];
    price: unknown;
    compareAtPrice?: unknown;
    brand: { name: string };
    sizes: { sizeLabel: string }[];
  }[];
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

export function ProductGrid({
  products,
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: ProductGridProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-text text-sm">
          No se encontraron productos con estos filtros.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildUrl={buildUrl}
          />
        </div>
      )}
    </>
  );
}
