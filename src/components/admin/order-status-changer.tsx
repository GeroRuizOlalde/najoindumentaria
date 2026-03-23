"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import {
  VALID_STATUS_TRANSITIONS,
  ORDER_STATUS_LABELS,
  type OrderStatusType,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/generated/prisma/client";

interface OrderStatusChangerProps {
  orderId: string;
  currentStatus: OrderStatusType;
}

export function OrderStatusChanger({
  orderId,
  currentStatus,
}: OrderStatusChangerProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];

  if (validTransitions.length === 0) return null;

  const handleChange = (newStatus: OrderStatusType) => {
    setError("");
    startTransition(async () => {
      const result = await updateOrderStatus(
        orderId,
        newStatus as OrderStatus,
        note || undefined,
        "admin"
      );
      if (result.error) {
        setError(result.error);
      } else {
        setNote("");
      }
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-text">
        Cambiar estado
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota opcional..."
        className="w-full h-16 border border-border p-2 text-sm resize-none focus:outline-none focus:border-black"
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {validTransitions.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={
              status === "CANCELLED" || status === "EXPIRED"
                ? "outline"
                : "primary"
            }
            onClick={() => handleChange(status)}
            loading={isPending}
          >
            {ORDER_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>
    </div>
  );
}
