"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlistItem } from "@/lib/actions/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WishlistToggleButtonProps {
  productId: string;
  productSlug: string;
  initialActive: boolean;
  isLoggedIn: boolean;
  className?: string;
}

export function WishlistToggleButton({
  productId,
  productSlug,
  initialActive,
  isLoggedIn,
  className,
}: WishlistToggleButtonProps) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("w-full", className)}
      loading={isPending}
      onClick={() => {
        if (!isLoggedIn) {
          router.push("/login");
          return;
        }

        startTransition(async () => {
          const result = await toggleWishlistItem(productId, productSlug);
          if (result.success) {
            setActive(!!result.active);
          }
        });
      }}
    >
      <Heart
        className={cn("mr-1.5 h-4 w-4", active && "fill-current text-black")}
      />
      {active ? "En favoritos" : "Guardar en favoritos"}
    </Button>
  );
}
