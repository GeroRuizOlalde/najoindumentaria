"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface CatalogFiltersProps {
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
}

const SORT_OPTIONS = [
  { value: "", label: "Relevancia" },
  { value: "newest", label: "Más nuevos" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

export function CatalogFilters({ categories, brands }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {/* Category filter (only on main /shop page) */}
      {pathname === "/shop" && (
        <select
          value={searchParams.get("categoria") || ""}
          onChange={(e) => updateParam("categoria", e.target.value)}
          className="h-9 border border-border bg-white px-3 text-xs focus:outline-none focus:border-black"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {/* Brand filter (only on main /shop page) */}
      {pathname === "/shop" && (
        <select
          value={searchParams.get("marca") || ""}
          onChange={(e) => updateParam("marca", e.target.value)}
          className="h-9 border border-border bg-white px-3 text-xs focus:outline-none focus:border-black"
        >
          <option value="">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      )}

      {/* Sort */}
      <select
        value={searchParams.get("sort") || ""}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="h-9 border border-border bg-white px-3 text-xs focus:outline-none focus:border-black ml-auto"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
