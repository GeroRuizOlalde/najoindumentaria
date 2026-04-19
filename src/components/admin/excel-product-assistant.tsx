"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface AssistantRow {
  sourceRow: number;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  price: number;
  compareAtPrice: number | null;
  description: string;
  shortDescription: string | null;
  images: string[];
  status: string;
  featured: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  sizes: {
    sizeLabel: string;
    isAvailable: boolean;
    stock: number;
  }[];
  warnings: string[];
}

interface ExcelProductAssistantProps {
  brands: Brand[];
  categories: Category[];
}

const HEADER_ALIASES: Record<string, string[]> = {
  name: ["producto", "nombre", "name", "articulo", "item"],
  brand: ["marca", "brand"],
  category: ["categoria", "rubro", "tipo", "category"],
  price: ["precio", "precio venta", "precio actual", "price"],
  compareAtPrice: [
    "precio lista",
    "precio original",
    "precio anterior",
    "compare at price",
    "compareatprice",
  ],
  description: ["descripcion", "detalle", "description"],
  shortDescription: ["descripcion corta", "resumen", "short description"],
  images: ["imagenes", "imagen", "foto", "fotos", "images"],
  sizes: ["talles", "talle", "sizes", "size"],
  stock: ["stock", "cantidad", "qty"],
};

const KNOWN_SIZE_LABELS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
];

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeLookup(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function findHeader(
  headers: string[],
  logicalKey: keyof typeof HEADER_ALIASES
) {
  return headers.find((header) =>
    HEADER_ALIASES[logicalKey].includes(normalizeHeader(header))
  );
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function splitList(value: unknown) {
  if (typeof value !== "string") return [];
  return value
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferSizes(record: Record<string, unknown>) {
  const sizeColumn = Object.keys(record).find((key) =>
    HEADER_ALIASES.sizes.includes(normalizeHeader(key))
  );
  const stockColumn = Object.keys(record).find((key) =>
    HEADER_ALIASES.stock.includes(normalizeHeader(key))
  );

  const directSizes = sizeColumn ? splitList(record[sizeColumn]) : [];
  const directStock = stockColumn ? Math.max(1, toNumber(record[stockColumn])) : 1;

  if (directSizes.length > 0) {
    return directSizes.map((size) => ({
      sizeLabel: size,
      isAvailable: directStock > 0,
      stock: directStock > 0 ? directStock : 0,
    }));
  }

  return Object.entries(record)
    .filter(([header, value]) => {
      const normalized = normalizeHeader(header).toUpperCase();
      return KNOWN_SIZE_LABELS.includes(normalized) && toNumber(value) > 0;
    })
    .map(([header, value]) => ({
      sizeLabel: normalizeHeader(header).toUpperCase(),
      isAvailable: true,
      stock: toNumber(value),
    }));
}

function mapWorkbookRows(
  rows: Record<string, unknown>[],
  brands: Brand[],
  categories: Category[]
) {
  const brandMap = new Map(
    brands.map((brand) => [normalizeLookup(brand.name), brand.id])
  );
  const categoryMap = new Map(
    categories.map((category) => [normalizeLookup(category.name), category.id])
  );

  return rows
    .map((record, index): AssistantRow | null => {
      const headers = Object.keys(record);
      const nameHeader = findHeader(headers, "name");
      const brandHeader = findHeader(headers, "brand");
      const categoryHeader = findHeader(headers, "category");
      const priceHeader = findHeader(headers, "price");
      const compareHeader = findHeader(headers, "compareAtPrice");
      const descriptionHeader = findHeader(headers, "description");
      const shortHeader = findHeader(headers, "shortDescription");
      const imagesHeader = findHeader(headers, "images");

      const name = String(nameHeader ? record[nameHeader] ?? "" : "").trim();
      if (!name) return null;

      const warnings: string[] = [];
      const brandName = String(brandHeader ? record[brandHeader] ?? "" : "").trim();
      const categoryName = String(
        categoryHeader ? record[categoryHeader] ?? "" : ""
      ).trim();

      const brandId = brandMap.get(normalizeLookup(brandName)) ?? "";
      const categoryId = categoryMap.get(normalizeLookup(categoryName)) ?? "";

      if (!brandId) warnings.push(`Marca sin match: ${brandName || "vacía"}`);
      if (!categoryId) {
        warnings.push(`Categoría sin match: ${categoryName || "vacía"}`);
      }

      const price = toNumber(priceHeader ? record[priceHeader] : 0);
      const compareAtPriceRaw = toNumber(compareHeader ? record[compareHeader] : 0);
      const compareAtPrice = compareAtPriceRaw > 0 ? compareAtPriceRaw : null;
      const sizes = inferSizes(record);

      if (!price) warnings.push("Precio faltante o inválido.");
      if (sizes.length === 0) warnings.push("No se detectaron talles con stock.");

      return {
        sourceRow: index + 2,
        name,
        slug: slugify(name),
        brandId,
        categoryId,
        price,
        compareAtPrice,
        description: String(
          descriptionHeader ? record[descriptionHeader] ?? "" : ""
        ).trim(),
        shortDescription: String(
          shortHeader ? record[shortHeader] ?? "" : ""
        ).trim() || null,
        images: imagesHeader ? splitList(record[imagesHeader]) : [],
        status: "DRAFT",
        featured: false,
        sortOrder: 0,
        metaTitle: null,
        metaDescription: null,
        sizes,
        warnings,
      };
    })
    .filter((row): row is AssistantRow => !!row);
}

export function ExcelProductAssistant({
  brands,
  categories,
}: ExcelProductAssistantProps) {
  const [rows, setRows] = useState<AssistantRow[]>([]);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const readyRows = useMemo(
    () => rows.filter((row) => row.warnings.length === 0).length,
    [rows]
  );

  async function handleFileChange(file: File | null) {
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
      defval: "",
    });

    const mappedRows = mapWorkbookRows(rawRows, brands, categories);
    const nextDraftKey = `product-draft-${Date.now()}`;

    sessionStorage.setItem(nextDraftKey, JSON.stringify(mappedRows));
    setDraftKey(nextDraftKey);
    setRows(mappedRows);
    setFileName(file.name);
  }

  return (
    <div className="space-y-6">
      <div className="border border-border bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-text">
          Asistente privado
        </p>
        <h2 className="mt-2 font-heading text-2xl font-semibold">
          Carga asistida desde Excel
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-text">
          Esta herramienta no publica nada sola. Solo lee la planilla, prepara
          los datos y te abre el formulario normal con una fila precargada para
          que vos sigas cargando producto por producto.
        </p>

        <label className="mt-5 flex cursor-pointer items-center justify-between border border-dashed border-border bg-off-white px-4 py-4 transition-colors hover:border-black">
          <div>
            <p className="text-sm font-medium">
              {fileName || "Elegí un archivo .xlsx o .xls"}
            </p>
            <p className="mt-1 text-xs text-gray-text">
              Se toma la primera hoja del Excel y no se sube a ningún lado.
            </p>
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null)
            }
          />
          <span className="border border-black px-3 py-2 text-xs font-medium uppercase tracking-wider">
            Leer archivo
          </span>
        </label>
      </div>

      {rows.length > 0 && (
        <div className="border border-border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <p className="text-sm font-medium">{rows.length} filas detectadas</p>
              <p className="text-xs text-gray-text">
                {readyRows} listas para cargar sin observaciones.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border">
            {rows.map((row, index) => (
              <div
                key={`${row.slug}-${index}`}
                className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_220px]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{row.name}</p>
                    <span className="text-xs text-gray-text">
                      Fila {row.sourceRow}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-text">
                    {row.sizes.length} talle{row.sizes.length !== 1 && "s"} con stock
                    {" · "}
                    {row.price > 0 ? `$${row.price}` : "Sin precio"}
                  </p>
                  {row.warnings.length > 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      {row.warnings.join(" | ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-start gap-2 lg:justify-end">
                  <Link
                    href={
                      draftKey
                        ? `/admin/productos/nuevo?draft=${encodeURIComponent(
                            draftKey
                          )}&row=${index}`
                        : "/admin/productos/nuevo"
                    }
                    className="inline-flex h-10 items-center justify-center border border-black px-4 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
                  >
                    Abrir en formulario
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
