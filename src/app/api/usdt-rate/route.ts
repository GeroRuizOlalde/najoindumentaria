import { NextResponse } from "next/server";

export const revalidate = 300;

interface ExchangeQuote {
  ask?: number;
  totalAsk?: number;
}

interface CachedRate {
  rate: number;
  source: string;
  fetchedAt: number;
}

let cache: CachedRate | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchFromCriptoYa(): Promise<CachedRate | null> {
  try {
    const res = await fetch("https://criptoya.com/api/usdt/ars/1", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, ExchangeQuote>;

    const preferred = ["binance", "buenbit", "lemoncash", "ripio", "satoshitango"];
    for (const key of preferred) {
      const q = data[key];
      const ask = q?.totalAsk ?? q?.ask;
      if (typeof ask === "number" && ask > 0) {
        return { rate: ask, source: `criptoya:${key}`, fetchedAt: Date.now() };
      }
    }

    const values = Object.values(data)
      .map((q) => q?.totalAsk ?? q?.ask)
      .filter((v): v is number => typeof v === "number" && v > 0);
    if (values.length === 0) return null;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { rate: avg, source: "criptoya:avg", fetchedAt: Date.now() };
  } catch {
    return null;
  }
}

async function fetchFromDolarApi(): Promise<CachedRate | null> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/cripto", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { venta?: number; compra?: number };
    const rate = data.venta ?? data.compra;
    if (typeof rate !== "number" || rate <= 0) return null;
    return { rate, source: "dolarapi:cripto", fetchedAt: Date.now() };
  } catch {
    return null;
  }
}

export async function GET() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cache);
  }

  const fresh = (await fetchFromCriptoYa()) ?? (await fetchFromDolarApi());
  if (fresh) {
    cache = fresh;
    return NextResponse.json(fresh);
  }

  if (cache) {
    return NextResponse.json({ ...cache, stale: true });
  }

  return NextResponse.json(
    { error: "No se pudo obtener la cotización USDT/ARS" },
    { status: 503 }
  );
}
