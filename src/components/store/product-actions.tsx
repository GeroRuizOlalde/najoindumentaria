"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SizeSelector } from "@/components/store/size-selector";
import { FormattedPrice } from "@/components/shared/formatted-price";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";
import { ShoppingBag, Check } from "lucide-react";

interface ProductActionsProps {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  brandName: string;
  price: number;
  compareAtPrice: number | null;
  sizes: { id: string; sizeLabel: string; stock: number; isAvailable: boolean }[];
}

export function ProductActions({
  productId,
  productSlug,
  productName,
  productImage,
  brandName,
  price,
  compareAtPrice,
  sizes,
}: ProductActionsProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();

  const selectedSize = sizes.find((s) => s.id === selectedSizeId);

  const handleAddToCart = () => {
    if (!selectedSizeId || !selectedSize) return;
    addItem({
      productId,
      sizeId: selectedSizeId,
      sizeLabel: selectedSize.sizeLabel,
      quantity: 1,
      price,
      productName,
      productImage,
      brandName,
      productSlug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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

      <div className="space-y-2">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedSizeId}
          variant={added ? "secondary" : "primary"}
          size="lg"
          className="w-full"
        >
          {added ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              Agregado al carrito
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              {selectedSizeId ? "Agregar al carrito" : "Seleccioná un talle"}
            </>
          )}
        </Button>
        <Button
          onClick={handleReserve}
          disabled={!selectedSizeId}
          variant="outline"
          size="lg"
          className="w-full"
        >
          Reservar ahora
        </Button>
      </div>

      <p className="text-[11px] text-gray-text text-center">
        Al reservar, tendrás 48hs para realizar la transferencia bancaria.
      </p>
    </div>
  );
}
