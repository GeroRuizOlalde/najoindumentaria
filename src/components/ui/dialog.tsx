"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Dialog({ open, onClose, children, className, title }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        "fixed inset-0 m-auto max-h-[85vh] w-full max-w-lg overflow-y-auto border border-border bg-white p-0 shadow-xl backdrop:bg-black/50",
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
      <div className="p-6">{children}</div>
    </dialog>
  );
}
