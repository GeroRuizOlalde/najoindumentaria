import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatusType,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: OrderStatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium",
        ORDER_STATUS_COLORS[status],
        className
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function ProductStatusBadge({
  status,
  className,
}: {
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  className?: string;
}) {
  const config = {
    DRAFT: { label: "Borrador", variant: "secondary" as const },
    ACTIVE: { label: "Activo", variant: "success" as const },
    ARCHIVED: { label: "Archivado", variant: "default" as const },
  };

  const { label, variant } = config[status];

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
