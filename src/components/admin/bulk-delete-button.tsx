"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Trash2 } from "lucide-react";

interface BulkDeleteButtonProps {
  action: () => Promise<{ success?: boolean; error?: string }>;
  confirmTitle: string;
  confirmDescription: string;
}

export function BulkDeleteButton({
  action,
  confirmTitle,
  confirmDescription,
}: BulkDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        Eliminar todos
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        onConfirm={handleConfirm}
        title={confirmTitle}
        description={error || confirmDescription}
        confirmLabel="Eliminar todos"
        variant="destructive"
        loading={isPending}
      />
    </>
  );
}
