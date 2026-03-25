"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/store/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPriceFromDecimal } from "@/lib/utils";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-light mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-sm text-gray-text mb-6">
          Explorá nuestros productos y agregá lo que te guste.
        </p>
        <Button asChild>
          <Link href="/shop">Ver productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <h1 className="font-heading text-2xl font-bold mb-8">
        Tu carrito ({totalItems} {totalItems === 1 ? "producto" : "productos"})
      </h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.sizeId}`}
            className="flex gap-4 border border-border p-4"
          >
            {/* Image */}
            {item.productImage && (
              <Link href={`/producto/${item.productSlug}`} className="shrink-0">
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={80}
                  height={100}
                  className="object-cover"
                />
              </Link>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/producto/${item.productSlug}`}
                className="text-sm font-medium hover:underline line-clamp-1"
              >
                {item.productName}
              </Link>
              <p className="text-xs text-gray-text mt-0.5">
                {item.brandName} &middot; Talle {item.sizeLabel}
              </p>
              <p className="text-sm font-medium mt-2">
                {formatPriceFromDecimal(item.price)}
              </p>

              {/* Quantity controls */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.sizeId, item.quantity - 1)
                  }
                  className="h-7 w-7 border border-border flex items-center justify-center hover:bg-off-white transition-colors"
                  aria-label="Reducir cantidad"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm w-6 text-center">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.sizeId, item.quantity + 1)
                  }
                  className="h-7 w-7 border border-border flex items-center justify-center hover:bg-off-white transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Subtotal + remove */}
            <div className="flex flex-col items-end justify-between">
              <button
                type="button"
                onClick={() => removeItem(item.productId, item.sizeId)}
                className="p-1 text-gray-text hover:text-error transition-colors"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <p className="text-sm font-medium">
                {formatPriceFromDecimal(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-text">Total</span>
          <span className="text-xl font-bold">
            {formatPriceFromDecimal(totalPrice)}
          </span>
        </div>

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push("/reserva?from=cart")}
          >
            Reservar pedido
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link href="/shop">Seguir comprando</Link>
          </Button>
        </div>

        <p className="text-[11px] text-gray-text text-center mt-4">
          Al reservar, tendrás 48hs para realizar la transferencia bancaria.
        </p>
      </div>
    </div>
  );
}
