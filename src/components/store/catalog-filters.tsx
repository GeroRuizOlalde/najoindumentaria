"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CatalogFiltersProps {
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
}

const SORT_OPTIONS = [
  { value: "", label: "Relevancia" },
  { value: "newest", label: "Mas nuevos" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

export function CatalogFilters({ categories, brands }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

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
    [pathname, router, searchParams]
  );

  return (
    <div className="mb-8 space-y-4">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          updateParam("search", search.trim());
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por producto, marca o categoria"
          className="h-10 w-full border border-border bg-white px-4 text-sm text-black placeholder:text-gray-light focus:border-black focus:outline-none"
        />
        <div className="flex gap-2">
          <Button type="submit">Buscar</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch("");
              updateParam("search", "");
            }}
          >
            Limpiar
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        {pathname === "/shop" && (
          <select
            value={searchParams.get("categoria") || ""}
            onChange={(event) => updateParam("categoria", event.target.value)}
            className="h-9 border border-border bg-white px-3 text-xs focus:border-black focus:outline-none"
          >
            <option value="">Todas las categorias</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        )}

        {pathname === "/shop" && (
          <select
            value={searchParams.get("marca") || ""}
            onChange={(event) => updateParam("marca", event.target.value)}
            className="h-9 border border-border bg-white px-3 text-xs focus:border-black focus:outline-none"
          >
            <option value="">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand.slug} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={searchParams.get("sort") || ""}
          onChange={(event) => updateParam("sort", event.target.value)}
          className="ml-auto h-9 border border-border bg-white px-3 text-xs focus:border-black focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
