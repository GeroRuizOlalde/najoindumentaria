"use client";

import { useState } from "react";
import Link from "next/link";
import { Sheet } from "@/components/ui/sheet";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
}

export function MobileMenu({
  open,
  onClose,
  categories,
  brands,
}: MobileMenuProps) {
  const [shopExpanded, setShopExpanded] = useState(false);

  return (
    <Sheet open={open} onClose={onClose} side="left" title="Menú">
      <nav className="-mx-6 -mt-2 space-y-1">
        <div>
          <button
            type="button"
            onClick={() => setShopExpanded(!shopExpanded)}
            className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors hover:bg-off-white"
          >
            Shop
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                shopExpanded && "rotate-180"
              )}
            />
          </button>
          {shopExpanded && (
            <div className="bg-off-white/50 pb-2">
              <p className="px-8 pb-1 pt-3 text-[10px] font-medium uppercase tracking-wider text-gray-text">
                Categorías
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/categoria/${cat.slug}`}
                  onClick={onClose}
                  className="block px-8 py-2 text-sm text-gray-text transition-colors hover:text-black"
                >
                  {cat.name}
                </Link>
              ))}
              <p className="px-8 pb-1 pt-3 text-[10px] font-medium uppercase tracking-wider text-gray-text">
                Marcas
              </p>
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/shop/marca/${brand.slug}`}
                  onClick={onClose}
                  className="block px-8 py-2 text-sm text-gray-text transition-colors hover:text-black"
                >
                  {brand.name}
                </Link>
              ))}
              <Link
                href="/shop"
                onClick={onClose}
                className="block px-8 py-2 text-sm font-medium transition-colors hover:text-bronze"
              >
                Ver todo →
              </Link>
              <Link
                href="/sale"
                onClick={onClose}
                className="block px-8 py-2 text-sm font-medium uppercase tracking-[0.18em] text-red-600 transition-colors hover:text-red-700"
              >
                Ir al sale
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/sale"
          onClick={onClose}
          className="block px-6 py-3 text-sm font-medium uppercase tracking-wider text-red-600 transition-colors hover:bg-off-white"
        >
          Sale
        </Link>
        <Link
          href="/como-comprar"
          onClick={onClose}
          className="block px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors hover:bg-off-white"
        >
          Cómo comprar
        </Link>
        <Link
          href="/nosotros"
          onClick={onClose}
          className="block px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors hover:bg-off-white"
        >
          Nosotros
        </Link>
        <Link
          href="/contacto"
          onClick={onClose}
          className="block px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors hover:bg-off-white"
        >
          Contacto
        </Link>
        <Link
          href="/seguimiento"
          onClick={onClose}
          className="block px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors hover:bg-off-white"
        >
          Seguimiento
        </Link>
      </nav>
    </Sheet>
  );
}
