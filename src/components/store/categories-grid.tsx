import Link from "next/link";

interface CategoriesGridProps {
  categories: { name: string; slug: string }[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-text mb-2">
          Explorar por
        </p>
        <h2 className="font-heading text-3xl font-bold tracking-tight">
          Categorías
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop/categoria/${cat.slug}`}
            className="group flex aspect-square items-center justify-center bg-off-white p-4 text-center transition-colors hover:bg-black hover:text-white"
          >
            <span className="text-xs font-medium uppercase tracking-wider">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
