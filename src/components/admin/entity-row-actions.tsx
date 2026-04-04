"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface EntityRowActionsProps {
  editHref: string;
  isActive: boolean;
  canManage: boolean;
  entityName: string;
  toggleLabel: {
    active: string;
    inactive: string;
  };
  onToggle: () => Promise<{ success?: boolean; error?: string }>;
  onDelete: () => Promise<{ success?: boolean; error?: string }>;
}

export function EntityRowActions({
  editHref,
  isActive,
  canManage,
  entityName,
  toggleLabel,
  onToggle,
  onDelete,
}: EntityRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!canManage) {
    return (
      <Link
        href={editHref}
        className="text-xs font-medium text-gray-text hover:text-black transition-colors"
      >
        Ver
      </Link>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-3">
        <Link
          href={editHref}
          className="text-xs font-medium text-gray-text hover:text-black transition-colors"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              const result = await onToggle();
              if (result.error) {
                setError(result.error);
              }
            })
          }
          className="text-xs font-medium text-gray-text hover:text-black transition-colors"
          disabled={isPending}
        >
          {isActive ? toggleLabel.active : toggleLabel.inactive}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-medium text-error hover:opacity-80 transition-opacity"
        >
          Eliminar
        </button>
      </div>

      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        onConfirm={() =>
          startTransition(async () => {
            const result = await onDelete();
            if (result.error) {
              setError(result.error);
              return;
            }
            setOpen(false);
          })
        }
        title={`Eliminar ${entityName}`}
        description={
          error ||
          `Se eliminará ${entityName.toLowerCase()} permanentemente. Esta acción no se puede deshacer.`
        }
        confirmLabel="Eliminar"
        variant="destructive"
        loading={isPending}
      />
    </>
  );
}
