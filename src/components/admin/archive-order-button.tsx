"use client";

import { useTransition } from "react";
import { archiveOrder, unarchiveOrder } from "@/lib/actions/orders";
import { Archive, ArchiveRestore } from "lucide-react";

interface ArchiveOrderButtonProps {
  orderId: string;
  isArchived: boolean;
}

export function ArchiveOrderButton({ orderId, isArchived }: ArchiveOrderButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      if (isArchived) {
        await unarchiveOrder(orderId);
      } else {
        await archiveOrder(orderId);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isArchived ? "Desarchivar" : "Archivar"}
      className="text-gray-text hover:text-black transition-colors disabled:opacity-50"
    >
      {isArchived ? (
        <ArchiveRestore className="h-4 w-4" />
      ) : (
        <Archive className="h-4 w-4" />
      )}
    </button>
  );
}
