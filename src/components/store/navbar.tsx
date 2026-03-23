"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { MobileMenu } from "@/components/store/mobile-menu";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavCategory {
  name: string;
  slug: string;
}

interface NavBrand {
  name: string;
  slug: string;
}

interface NavbarProps {
  categories: NavCategory[];
  brands: NavBrand[];
}

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/como-comprar", label: "Cómo comprar" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar({ categories, brands }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Logo href="/" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) =>
              link.href === "/shop" ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <Link
                    href="/shop"
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider transition-colors hover:text-black",
                      pathname.startsWith("/shop")
                        ? "text-black"
                        : "text-gray-text"
                    )}
                  >
                    {link.label}
                  </Link>

                  {/* Mega menu */}
                  {shopOpen && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
                      <div className="w-[480px] border border-border bg-white p-6 shadow-lg">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-text mb-3">
                              Categorías
                            </p>
                            <ul className="space-y-2">
                              {categories.map((cat) => (
                                <li key={cat.slug}>
                                  <Link
                                    href={`/shop/categoria/${cat.slug}`}
                                    className="text-sm hover:text-bronze transition-colors"
                                    onClick={() => setShopOpen(false)}
                                  >
                                    {cat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-text mb-3">
                              Marcas
                            </p>
                            <ul className="space-y-2">
                              {brands.map((brand) => (
                                <li key={brand.slug}>
                                  <Link
                                    href={`/shop/marca/${brand.slug}`}
                                    className="text-sm hover:text-bronze transition-colors"
                                    onClick={() => setShopOpen(false)}
                                  >
                                    {brand.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-border">
                          <Link
                            href="/shop"
                            className="text-xs font-medium uppercase tracking-wider hover:text-bronze transition-colors"
                            onClick={() => setShopOpen(false)}
                          >
                            Ver todo →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xs font-medium uppercase tracking-wider transition-colors hover:text-black",
                    pathname === link.href ? "text-black" : "text-gray-text"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right actions */}
          <Link
            href="/seguimiento"
            className="p-2 text-gray-text hover:text-black transition-colors"
            aria-label="Seguimiento de pedido"
          >
            <Search className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        categories={categories}
        brands={brands}
      />
    </>
  );
}
