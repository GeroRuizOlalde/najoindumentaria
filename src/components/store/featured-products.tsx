import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";

interface FeaturedProductsProps {
  products: {
    slug: string;
    name: string;
    images: string[];
    price: unknown;
    compareAtPrice?: unknown;
    brand: { name: string };
    sizes: { sizeLabel: string }[];
  }[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-text mb-2">
            Selección
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            Destacados
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-xs font-medium uppercase tracking-wider text-gray-text hover:text-black transition-colors"
        >
          Ver todo →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
