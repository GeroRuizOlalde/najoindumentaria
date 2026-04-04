import Link from "next/link";

interface HeroSectionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export function HeroSection({
  eyebrow = "Streetwear premium",
  title = "NAJO",
  subtitle = "INDUMENTARIA",
  description = "Indumentaria y zapatillas de las mejores marcas. Estilo urbano con actitud.",
  primaryCtaLabel = "Explorar catalogo",
  primaryCtaHref = "/shop",
  secondaryCtaLabel = "Como comprar ->",
  secondaryCtaHref = "/como-comprar",
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      <div className="relative z-10 px-4 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-gray-light">
          {eyebrow}
        </p>
        <h1 className="font-heading text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
          {title}
        </h1>
        <p className="mt-2 font-heading text-lg tracking-[0.3em] text-gray-light sm:text-xl">
          {subtitle}
        </p>
        <div className="mx-auto mt-8 h-px w-16 bg-white/30" />
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-gray-light">
          {description}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={primaryCtaHref}
            className="inline-flex h-12 items-center justify-center border border-white px-8 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
          >
            {primaryCtaLabel}
          </Link>
          <Link
            href={secondaryCtaHref}
            className="inline-flex h-12 items-center justify-center px-8 text-xs font-medium uppercase tracking-wider text-gray-light transition-colors hover:text-white"
          >
            {secondaryCtaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
