"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
  title?: string;
  className?: string;
}

export function Sheet({
  open,
  onClose,
  children,
  side = "right",
  title,
  className,
}: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 w-full max-w-sm bg-white shadow-xl transition-transform duration-300",
          side === "left" ? "left-0" : "right-0",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-heading text-lg font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-text hover:text-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-6 h-full">{children}</div>
      </div>
    </>
  );
}
