import Link from "next/link";

interface BrandsCarouselProps {
  brands: { name: string; slug: string }[];
}

export function BrandsCarousel({ brands }: BrandsCarouselProps) {
  if (brands.length === 0) return null;

  return (
    <section className="border-y border-border bg-off-white py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-gray-text mb-10">
          Marcas que trabajamos
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/shop/marca/${brand.slug}`}
              className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-gray-text/50 transition-colors hover:text-black"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
