import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      <div className="relative z-10 text-center px-4">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-light mb-4">
          Streetwear premium
        </p>
        <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight">
          NAJO
        </h1>
        <p className="mt-2 font-heading text-lg sm:text-xl tracking-[0.3em] text-gray-light">
          INDUMENTARIA
        </p>
        <div className="mx-auto mt-8 h-px w-16 bg-white/30" />
        <p className="mt-6 text-sm text-gray-light max-w-md mx-auto leading-relaxed">
          Indumentaria y zapatillas de las mejores marcas. Estilo urbano con
          actitud.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center border border-white px-8 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
          >
            Explorar catálogo
          </Link>
          <Link
            href="/como-comprar"
            className="inline-flex h-12 items-center justify-center px-8 text-xs font-medium uppercase tracking-wider text-gray-light transition-colors hover:text-white"
          >
            Cómo comprar →
          </Link>
        </div>
      </div>
    </section>
  );
}
