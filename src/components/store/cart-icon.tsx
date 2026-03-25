"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";

export function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/carrito"
      className="relative p-2 text-gray-text hover:text-black transition-colors"
      aria-label="Carrito"
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-medium h-4 w-4 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
