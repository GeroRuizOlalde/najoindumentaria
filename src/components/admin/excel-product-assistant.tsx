"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import {
  bulkCreateProducts,
  type BulkDraftInput,
  type BulkResult,
} from "@/lib/actions/bulk-products";

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
  name: [
    "producto",
    "nombre",
    "name",
    "articulo",
    "item",
    "titulo de prenda",
    "titulo",
    "title",
  ],
  brand: ["marca", "brand"],
  category: [
    "categoria",
    "rubro",
    "tipo",
    "category",
    "tipo de prenda",
  ],
  price: [
    "precio",
    "precio venta",
    "precio actual",
    "price",
    "precio venta x prenda",
    "precio venta x prenda usd",
    "precio venta prenda",
  ],
  compareAtPrice: [
    "precio lista",
    "precio original",
    "precio anterior",
    "compare at price",
    "compareatprice",
  ],
  description: ["descripcion", "detalle", "description"],
  shortDescription: ["descripcion corta", "resumen", "short description"],
  images: [
    "imagenes",
    "imagen",
    "foto",
    "fotos",
    "images",
    "link fotos",
    "link foto",
    "links fotos",
  ],
  sizes: ["talles", "talle", "sizes", "size"],
  stock: ["stock"],
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
    const cleaned = value.replace(/[^0-9,.\-]/g, "").replace(",", ".");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function splitList(value: unknown) {
  if (typeof value !== "string") return [];
  return value
    .split(/[;,|\n]/)
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
  const directStock = stockColumn ? Math.max(0, toNumber(record[stockColumn])) : 0;

  if (directSizes.length > 0) {
    return directSizes.map((size) => ({
      sizeLabel: size.toUpperCase(),
      isAvailable: directStock > 0,
      stock: directStock,
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

  const mapped = rows
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

  return groupByProduct(mapped);
}

function groupByProduct(rows: AssistantRow[]): AssistantRow[] {
  const groups = new Map<string, AssistantRow>();

  for (const row of rows) {
    const key = `${normalizeLookup(row.name)}|${row.brandId || "_"}`;
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, { ...row, sizes: [...row.sizes], warnings: [...row.warnings], images: [...row.images] });
      continue;
    }

    for (const newSize of row.sizes) {
      const match = existing.sizes.find(
        (s) => s.sizeLabel === newSize.sizeLabel
      );
      if (match) {
        match.stock += newSize.stock;
        match.isAvailable = match.stock > 0;
      } else {
        existing.sizes.push(newSize);
      }
    }

    for (const img of row.images) {
      if (!existing.images.includes(img)) existing.images.push(img);
    }

    for (const warning of row.warnings) {
      if (!existing.warnings.includes(warning)) existing.warnings.push(warning);
    }

    if (!existing.price && row.price) existing.price = row.price;
  }

  return Array.from(groups.values()).map((group) => {
    const hasStock = group.sizes.some((s) => s.stock > 0);
    if (!hasStock && !group.warnings.includes("Sin stock en ningún talle")) {
      group.warnings.push("Sin stock en ningún talle");
    }
    return group;
  });
}

function applyExchangeRate(rows: AssistantRow[], rate: number): AssistantRow[] {
  if (!rate || rate === 1) return rows;
  return rows.map((row) => ({
    ...row,
    price: Math.round(row.price * rate),
    compareAtPrice:
      row.compareAtPrice != null ? Math.round(row.compareAtPrice * rate) : null,
  }));
}

export function ExcelProductAssistant({
  brands,
  categories,
}: ExcelProductAssistantProps) {
  const [rawRows, setRawRows] = useState<AssistantRow[]>([]);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [bulkState, setBulkState] = useState<{
    running: boolean;
    done: number;
    total: number;
    created: string[];
    createdWithoutImages: string[];
    failed: { name: string; reason: string }[];
    skipped: { name: string; reason: string }[];
  } | null>(null);

  const rows = useMemo(
    () => applyExchangeRate(rawRows, exchangeRate),
    [rawRows, exchangeRate]
  );

  const visibleRows = useMemo(
    () =>
      showOutOfStock
        ? rows
        : rows.filter((row) => row.sizes.some((s) => s.stock > 0)),
    [rows, showOutOfStock]
  );

  const readyRows = useMemo(
    () => visibleRows.filter((row) => row.warnings.length === 0).length,
    [visibleRows]
  );

  useEffect(() => {
    if (!draftKey || rows.length === 0) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(rows));
    } catch {
      // sessionStorage quota o serializacion: ignoramos silenciosamente
    }
  }, [rows, draftKey]);

  function toDraftInput(row: AssistantRow): BulkDraftInput {
    return {
      name: row.name,
      slug: row.slug,
      brandId: row.brandId,
      categoryId: row.categoryId,
      price: row.price,
      compareAtPrice: row.compareAtPrice,
      description: row.description,
      shortDescription: row.shortDescription,
      images: row.images,
      sizes: row.sizes,
    };
  }

  async function handleBulkCreate() {
    if (bulkState?.running) return;

    const candidates = visibleRows;
    const skipped: { name: string; reason: string }[] = [];
    const ready: AssistantRow[] = [];

    for (const row of candidates) {
      if (!row.brandId) {
        skipped.push({ name: row.name, reason: "Marca no matcheada" });
        continue;
      }
      if (!row.categoryId) {
        skipped.push({ name: row.name, reason: "Categoría no matcheada" });
        continue;
      }
      if (!row.price) {
        skipped.push({ name: row.name, reason: "Precio faltante" });
        continue;
      }
      if (!row.sizes.some((s) => s.stock > 0)) {
        skipped.push({ name: row.name, reason: "Sin stock en ningún talle" });
        continue;
      }
      ready.push(row);
    }

    if (ready.length === 0) {
      setBulkState({
        running: false,
        done: 0,
        total: 0,
        created: [],
        createdWithoutImages: [],
        failed: [],
        skipped,
      });
      return;
    }

    setBulkState({
      running: true,
      done: 0,
      total: ready.length,
      created: [],
      createdWithoutImages: [],
      failed: [],
      skipped,
    });

    const allCreated: string[] = [];
    const allCreatedWithoutImages: string[] = [];
    const allFailed: { name: string; reason: string }[] = [];

    for (let i = 0; i < ready.length; i += 1) {
      const row = ready[i];
      let result: BulkResult;
      try {
        result = await bulkCreateProducts([toDraftInput(row)]);
      } catch (error) {
        result = {
          created: [],
          createdWithoutImages: [],
          failed: [
            {
              name: row.name,
              reason:
                error instanceof Error ? error.message : "Error de red",
            },
          ],
        };
      }

      allCreated.push(...result.created);
      allCreatedWithoutImages.push(...result.createdWithoutImages);
      allFailed.push(...result.failed);

      setBulkState({
        running: i < ready.length - 1,
        done: i + 1,
        total: ready.length,
        created: [...allCreated],
        createdWithoutImages: [...allCreatedWithoutImages],
        failed: [...allFailed],
        skipped,
      });
    }
  }

  async function handleFileChange(file: File | null) {
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawSheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      firstSheet,
      { defval: "" }
    );

    const mappedRows = mapWorkbookRows(rawSheetRows, brands, categories);
    const nextDraftKey = `product-draft-${Date.now()}`;

    setRawRows(mappedRows);
    setDraftKey(nextDraftKey);
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

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <label className="flex cursor-pointer items-center justify-between border border-dashed border-border bg-off-white px-4 py-4 transition-colors hover:border-black">
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

          <div className="border border-border bg-off-white px-4 py-3">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-text">
              Cotización USD → ARS
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={exchangeRate}
              onChange={(event) =>
                setExchangeRate(Number(event.target.value) || 0)
              }
              className="mt-2 w-full border border-border bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
            <p className="mt-2 text-xs text-gray-text">
              Si tu planilla ya está en pesos, dejá <strong>1</strong>.
              Si está en USD, poné la cotización del día (ej. <strong>1200</strong>).
            </p>
          </div>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="border border-border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <p className="text-sm font-medium">
                {visibleRows.length} producto{visibleRows.length !== 1 && "s"} detectado
                {visibleRows.length !== 1 && "s"}
                {rows.length !== visibleRows.length && (
                  <span className="text-gray-text">
                    {" "}
                    (de {rows.length} totales)
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-text">
                {readyRows} listos para cargar sin observaciones.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-gray-text">
                <input
                  type="checkbox"
                  checked={showOutOfStock}
                  onChange={(event) => setShowOutOfStock(event.target.checked)}
                  className="h-4 w-4 border border-border"
                />
                Mostrar también agotados
              </label>
              <button
                type="button"
                onClick={handleBulkCreate}
                disabled={bulkState?.running || visibleRows.length === 0}
                className="inline-flex h-10 items-center justify-center border border-black bg-black px-4 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkState?.running
                  ? `Creando ${bulkState.done}/${bulkState.total}...`
                  : "Crear todos automáticamente"}
              </button>
            </div>
          </div>

          {bulkState && (
            <div className="border-b border-border bg-off-white px-5 py-4 text-sm">
              {bulkState.running ? (
                <p className="font-medium">
                  Procesando {bulkState.done} de {bulkState.total}... No cierres
                  esta pestaña.
                </p>
              ) : (
                <p className="font-medium">
                  Proceso finalizado: {bulkState.created.length} creados
                  {bulkState.createdWithoutImages.length > 0 && (
                    <>
                      {" "}
                      ({bulkState.createdWithoutImages.length} sin imágenes)
                    </>
                  )}
                  , {bulkState.failed.length} fallidos,{" "}
                  {bulkState.skipped.length} salteados.
                </p>
              )}
              {(bulkState.failed.length > 0 ||
                bulkState.skipped.length > 0 ||
                bulkState.createdWithoutImages.length > 0) && (
                <details className="mt-2 text-xs text-gray-text">
                  <summary className="cursor-pointer font-medium">
                    Ver detalle
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {bulkState.failed.map((f, idx) => (
                      <li key={`f-${idx}`} className="text-red-700">
                        ❌ {f.name} — {f.reason}
                      </li>
                    ))}
                    {bulkState.createdWithoutImages.map((name, idx) => (
                      <li key={`ni-${idx}`} className="text-blue-700">
                        📷 {name} — creado sin imágenes, subir a mano
                      </li>
                    ))}
                    {bulkState.skipped.map((s, idx) => (
                      <li key={`s-${idx}`} className="text-amber-700">
                        ⚠ {s.name} — {s.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {bulkState.created.length > 0 && !bulkState.running && (
                <p className="mt-2 text-xs">
                  Los productos se crearon como <strong>borrador (DRAFT)</strong>.
                  {" "}
                  Revisalos en{" "}
                  <Link
                    href="/admin/productos"
                    className="underline hover:text-black"
                  >
                    /admin/productos
                  </Link>{" "}
                  y pasalos a ACTIVE cuando estén OK.
                </p>
              )}
            </div>
          )}

          <div className="divide-y divide-border">
            {visibleRows.map((row, index) => (
              <div
                key={`${row.slug}-${index}`}
                className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_220px]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{row.name}</p>
                    <span className="text-xs text-gray-text">
                      {row.sizes.length} talle{row.sizes.length !== 1 && "s"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-text">
                    Stock total:{" "}
                    {row.sizes.reduce((acc, s) => acc + s.stock, 0)} unidades
                    {" · "}
                    {row.price > 0
                      ? `$${row.price.toLocaleString("es-AR")}`
                      : "Sin precio"}
                  </p>
                  <p className="mt-1 text-xs text-gray-text">
                    Talles:{" "}
                    {row.sizes
                      .map((s) => `${s.sizeLabel} (${s.stock})`)
                      .join(" · ") || "—"}
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
                          )}&row=${rows.indexOf(row)}`
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
