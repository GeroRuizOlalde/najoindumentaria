"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Archive, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteProduct, archiveProduct } from "@/lib/actions/products";

interface ProductRowActionsProps {
  productId: string;
  productName: string;
  editHref: string;
  canManage: boolean;
}

type ActionKind = "delete" | "archive" | null;

export function ProductRowActions({
  productId,
  productName,
  editHref,
  canManage,
}: ProductRowActionsProps) {
  const [action, setAction] = useState<ActionKind>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function closeDialog() {
    setAction(null);
    setError(null);
  }

  function handleConfirm() {
    if (!action) return;
    setError(null);
    const runner = action === "delete" ? deleteProduct : archiveProduct;
    startTransition(async () => {
      const result = await runner(productId);
      if (result.error) {
        setError(result.error);
      } else {
        closeDialog();
      }
    });
  }

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
      <div className="flex items-center gap-3 justify-end">
        <Link
          href={editHref}
          className="text-xs font-medium text-gray-text hover:text-black transition-colors"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={() => setAction("archive")}
          title="Archivar"
          aria-label={`Archivar ${productName}`}
          className="text-gray-text hover:text-black transition-colors"
        >
          <Archive className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setAction("delete")}
          title="Eliminar"
          aria-label={`Eliminar ${productName}`}
          className="text-gray-text hover:text-error transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <ConfirmDialog
        open={action === "delete"}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title="Eliminar producto"
        description={
          error ||
          `Se eliminara permanentemente "${productName}", sus talles y los pedidos asociados. Esta accion no se puede deshacer.`
        }
        confirmLabel="Eliminar"
        variant="destructive"
        loading={isPending}
      />

      <ConfirmDialog
        open={action === "archive"}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title="Archivar producto"
        description={
          error ||
          `"${productName}" dejara de estar visible en la tienda pero se conservara junto con sus pedidos. Podes reactivarlo desde la edicion.`
        }
        confirmLabel="Archivar"
        loading={isPending}
      />
    </>
  );
}
