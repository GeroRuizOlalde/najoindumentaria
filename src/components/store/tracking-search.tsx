"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TrackingSearchProps {
  initialCode?: string;
}

export function TrackingSearch({ initialCode }: TrackingSearchProps) {
  const [code, setCode] = useState(initialCode || "");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/seguimiento?codigo=${encodeURIComponent(code.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Ej: NAJO-A1B2C3"
        className="flex-1 h-11 border border-border px-4 text-sm font-mono uppercase tracking-wider placeholder:text-gray-light focus:outline-none focus:border-black transition-colors"
      />
      <Button type="submit">Buscar</Button>
    </form>
  );
}
