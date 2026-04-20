"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface DeleteButtonProps {
  action: () => Promise<{ success?: boolean; error?: string }>;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel?: string;
  variant?: "icon" | "button";
  buttonLabel?: string;
  redirectTo?: string;
  title?: string;
}

export function DeleteButton({
  action,
  confirmTitle,
  confirmDescription,
  confirmLabel = "Eliminar",
  variant = "icon",
  buttonLabel = "Eliminar",
  redirectTo,
  title = "Eliminar",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={title}
          aria-label={title}
          disabled={isPending}
          className="text-gray-text hover:text-error transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          {buttonLabel}
        </Button>
      )}

      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        onConfirm={handleConfirm}
        title={confirmTitle}
        description={error || confirmDescription}
        confirmLabel={confirmLabel}
        variant="destructive"
        loading={isPending}
      />
    </>
  );
}
