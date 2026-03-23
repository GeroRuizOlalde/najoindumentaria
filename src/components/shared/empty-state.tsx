import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="mb-4 text-gray-light">
        {icon || <Package className="h-12 w-12" />}
      </div>
      <h3 className="font-heading text-lg font-medium text-black">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-text">{description}</p>
      )}
      {action && (
        <Button
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
