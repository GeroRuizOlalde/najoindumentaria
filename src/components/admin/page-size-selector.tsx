"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface PageSizeSelectorProps {
  value: string;
  options?: Array<{ value: string; label: string }>;
}

const DEFAULT_OPTIONS = [
  { value: "12", label: "12" },
  { value: "24", label: "24" },
  { value: "48", label: "48" },
  { value: "all", label: "Todos" },
];

export function PageSizeSelector({
  value,
  options = DEFAULT_OPTIONS,
}: PageSizeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    const qs = new URLSearchParams(searchParams.toString());
    if (next === "12") qs.delete("limit");
    else qs.set("limit", next);
    qs.delete("page");
    const query = qs.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs text-gray-text">
      <span className="uppercase tracking-wider">Ver</span>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="h-9 border border-border bg-white px-2 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
