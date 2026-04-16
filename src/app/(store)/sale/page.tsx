import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getSaleProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/store/product-grid";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: "Sale",
  description:
    "Descubrí productos en promoción con stock disponible en Najo Indumentaria.",
};

export default async function SalePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await getSaleProducts(page, 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <section className="relative overflow-hidden border border-red-100 bg-[linear-gradient(135deg,#fff8f5_0%,#fff_52%,#fff0eb_100%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-red-100/70 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-6 translate-y-6 rounded-full bg-orange-100/70 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-red-200 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-red-600">
              <Sparkles className="h-3.5 w-3.5" />
              Promociones activas
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Sale con stock real, sin humo.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-text sm:text-base">
              Acá ves solo productos en promoción que todavía tienen talles
              disponibles. El precio original aparece tachado y el valor final
              queda bien claro.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="border border-black bg-black px-4 py-3 text-white">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                Productos en sale
              </p>
              <p className="mt-1 text-2xl font-semibold">{result.total}</p>
            </div>
            <Link
              href="/shop"
              className="inline-flex h-12 items-center gap-2 border border-border bg-white px-5 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:border-black"
            >
              Ver catálogo completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <ProductGrid
          products={result.products}
          currentPage={result.currentPage}
          totalPages={result.totalPages}
          baseUrl="/sale"
        />
      </section>
    </div>
  );
}
