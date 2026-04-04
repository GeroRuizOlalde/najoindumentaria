"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check } from "lucide-react";
import { SizeSelector } from "@/components/store/size-selector";
import { FormattedPrice } from "@/components/shared/formatted-price";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";
import { WishlistToggleButton } from "@/components/store/wishlist-toggle-button";

interface ProductActionsProps {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  brandName: string;
  price: number;
  compareAtPrice: number | null;
  sizes: { id: string; sizeLabel: string; stock: number; isAvailable: boolean }[];
  isWishlisted: boolean;
  isLoggedIn: boolean;
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
  isWishlisted,
  isLoggedIn,
}: ProductActionsProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();

  const selectedSize = sizes.find((size) => size.id === selectedSizeId);

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
    router.push(`/reserva?producto=${productId}&talle=${selectedSizeId}&slug=${productSlug}`);
  };

  return (
    <div className="space-y-6">
      <FormattedPrice price={price} compareAtPrice={compareAtPrice} size="lg" />

      <SizeSelector
        sizes={sizes}
        selectedSizeId={selectedSizeId}
        onSelect={setSelectedSizeId}
      />

      {selectedSize && selectedSize.stock <= 3 && selectedSize.stock > 0 && (
        <p className="text-xs text-warning">Ultimas {selectedSize.stock} unidades.</p>
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
              <Check className="mr-1.5 h-4 w-4" />
              Agregado al carrito
            </>
          ) : (
            <>
              <ShoppingBag className="mr-1.5 h-4 w-4" />
              {selectedSizeId ? "Agregar al carrito" : "Selecciona un talle"}
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
        <WishlistToggleButton
          productId={productId}
          productSlug={productSlug}
          initialActive={isWishlisted}
          isLoggedIn={isLoggedIn}
        />
      </div>

      <p className="text-center text-[11px] text-gray-text">
        Al reservar, tendras 48hs para realizar la transferencia bancaria.
      </p>
    </div>
  );
}
