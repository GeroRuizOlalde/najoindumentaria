import Image from "next/image";
import Link from "next/link";
import { FormattedPrice } from "@/components/shared/formatted-price";

interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    images: string[];
    price: unknown;
    compareAtPrice?: unknown;
    brand: { name: string };
    sizes: { sizeLabel: string }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const price = Number(product.price);
  const compareAt = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-off-white">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-text text-xs">
            Sin imagen
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[11px] uppercase tracking-wider text-gray-text">
          {product.brand.name}
        </p>
        <h3 className="mt-0.5 text-sm font-medium group-hover:text-bronze transition-colors">
          {product.name}
        </h3>
        <FormattedPrice
          price={price}
          compareAtPrice={compareAt}
          size="sm"
          className="mt-1"
        />
        {product.sizes.length > 0 && (
          <p className="mt-1 text-[10px] text-gray-text">
            {product.sizes.length} talle{product.sizes.length !== 1 && "s"}{" "}
            disponible{product.sizes.length !== 1 && "s"}
          </p>
        )}
      </div>
    </Link>
  );
}
