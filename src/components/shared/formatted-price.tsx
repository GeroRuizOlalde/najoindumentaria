import { cn } from "@/lib/utils";
import { formatPriceFromDecimal } from "@/lib/utils";

interface FormattedPriceProps {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FormattedPrice({
  price,
  compareAtPrice,
  className,
  size = "md",
}: FormattedPriceProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn("font-medium", {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-xl": size === "lg",
        })}
      >
        {formatPriceFromDecimal(price)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-gray-text line-through">
          {formatPriceFromDecimal(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
