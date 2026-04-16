"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TrackingSearchProps {
  initialCode?: string;
  initialEmail?: string;
  requireEmail?: boolean;
}

export function TrackingSearch({
  initialCode,
  initialEmail,
  requireEmail = true,
}: TrackingSearchProps) {
  const [code, setCode] = useState(initialCode || "");
  const [email, setEmail] = useState(initialEmail || "");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() && (!requireEmail || email.trim())) {
      const params = new URLSearchParams({
        codigo: code.trim(),
      });

      if (email.trim()) {
        params.set("email", email.trim().toLowerCase());
      }

      router.push(`/seguimiento?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Ej: NAJO-A1B2C3"
        className="w-full h-11 border border-border px-4 text-sm font-mono uppercase tracking-wider placeholder:text-gray-light focus:outline-none focus:border-black transition-colors"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email de compra"
        required={requireEmail}
        className="w-full h-11 border border-border px-4 text-sm placeholder:text-gray-light focus:outline-none focus:border-black transition-colors"
      />
      <Button type="submit" className="w-full sm:w-auto">
        Buscar
      </Button>
    </form>
  );
}
