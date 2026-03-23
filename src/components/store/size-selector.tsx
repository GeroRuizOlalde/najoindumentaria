"use client";

import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: { id: string; sizeLabel: string; stock: number; isAvailable: boolean }[];
  selectedSizeId: string | null;
  onSelect: (sizeId: string) => void;
}

export function SizeSelector({
  sizes,
  selectedSizeId,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-text mb-3">
        Talle
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const outOfStock = !size.isAvailable || size.stock === 0;
          return (
            <button
              key={size.id}
              type="button"
              disabled={outOfStock}
              onClick={() => onSelect(size.id)}
              className={cn(
                "flex h-10 min-w-[44px] items-center justify-center border px-3 text-sm font-medium transition-colors",
                selectedSizeId === size.id
                  ? "border-black bg-black text-white"
                  : outOfStock
                  ? "border-border text-gray-light cursor-not-allowed line-through"
                  : "border-border hover:border-black"
              )}
            >
              {size.sizeLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
