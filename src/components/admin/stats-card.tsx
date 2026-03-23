import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("border border-border bg-white p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-text">
            {title}
          </p>
          <p className="mt-2 font-heading text-3xl font-bold">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-text">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend.positive ? "text-success" : "text-error"
              )}
            >
              {trend.positive ? "+" : ""}
              {trend.value}% vs mes anterior
            </p>
          )}
        </div>
        <div className="rounded bg-off-white p-2.5">
          <Icon className="h-5 w-5 text-gray-text" />
        </div>
      </div>
    </div>
  );
}
