"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface UsdtRateResponse {
  enabled: boolean;
  rate?: number;
  source?: string;
  fetchedAt?: number;
  stale?: boolean;
}

let cachedPromise: Promise<UsdtRateResponse | null> | null = null;
let cachedAt = 0;
const CLIENT_TTL_MS = 5 * 60 * 1000;

function fetchRate(): Promise<UsdtRateResponse | null> {
  if (cachedPromise && Date.now() - cachedAt < CLIENT_TTL_MS) return cachedPromise;
  cachedAt = Date.now();
  cachedPromise = fetch("/api/usdt-rate")
    .then(async (res) => {
      if (!res.ok && res.status !== 503) return null;
      return (await res.json()) as UsdtRateResponse;
    })
    .catch(() => null);
  return cachedPromise;
}

export function UsdtEquivalent({
  amount,
  className,
  prefix = "≈ ",
}: {
  amount: number;
  className?: string;
  prefix?: string;
}) {
  const [data, setData] = useState<UsdtRateResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRate().then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data?.enabled || !data.rate || data.rate <= 0 || amount <= 0) return null;

  const usdt = amount / data.rate;

  return (
    <p className={cn("text-xs text-gray-text", className)}>
      {prefix}
      {usdt.toFixed(2)} USDT
    </p>
  );
}
