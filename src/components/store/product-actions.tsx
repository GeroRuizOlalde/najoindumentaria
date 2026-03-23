"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SizeSelector } from "@/components/store/size-selector";
import { FormattedPrice } from "@/components/shared/formatted-price";
import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  productId: string;
  productSlug: string;
  price: number;
  compareAtPrice: number | null;
  sizes: { id: string; sizeLabel: string; stock: number; isAvailable: boolean }[];
}

export function ProductActions({
  productId,
  productSlug,
  price,
  compareAtPrice,
  sizes,
}: ProductActionsProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const router = useRouter();

  const selectedSize = sizes.find((s) => s.id === selectedSizeId);

  const handleReserve = () => {
    if (!selectedSizeId || !selectedSize) return;
    router.push(
      `/reserva?producto=${productId}&talle=${selectedSizeId}&slug=${productSlug}`
    );
  };

  return (
    <div className="space-y-6">
      <FormattedPrice
        price={price}
        compareAtPrice={compareAtPrice}
        size="lg"
      />

      <SizeSelector
        sizes={sizes}
        selectedSizeId={selectedSizeId}
        onSelect={setSelectedSizeId}
      />

      {selectedSize && selectedSize.stock <= 3 && selectedSize.stock > 0 && (
        <p className="text-xs text-warning">
          ¡Últimas {selectedSize.stock} unidades!
        </p>
      )}

      <Button
        onClick={handleReserve}
        disabled={!selectedSizeId}
        size="lg"
        className="w-full"
      >
        {selectedSizeId ? "Reservar ahora" : "Seleccioná un talle"}
      </Button>

      <p className="text-[11px] text-gray-text text-center">
        Al reservar, tendrás 48hs para realizar la transferencia bancaria.
      </p>
    </div>
  );
}
