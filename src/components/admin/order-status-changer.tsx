"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import {
  VALID_STATUS_TRANSITIONS,
  ORDER_STATUS_LABELS,
  type OrderStatusType,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderStatus } from "@/generated/prisma/client";
import { MessageCircle } from "lucide-react";

interface OrderStatusChangerProps {
  orderId: string;
  currentStatus: OrderStatusType;
  customerPhone?: string;
  customerName?: string;
  orderCode?: string;
}

export function OrderStatusChanger({
  orderId,
  currentStatus,
  customerPhone,
  customerName,
  orderCode,
}: OrderStatusChangerProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];

  const showWhatsApp =
    customerPhone &&
    ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].includes(currentStatus);

  const whatsappMessage = customerName && orderCode
    ? encodeURIComponent(
        `Hola ${customerName}! Te informamos sobre tu pedido ${orderCode}.`
      )
    : "";

  const whatsappUrl = customerPhone
    ? `https://wa.me/${customerPhone.replace(/\D/g, "")}?text=${whatsappMessage}`
    : "";

  if (validTransitions.length === 0 && !showWhatsApp) return null;

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

      {showWhatsApp && (
        <>
          <Separator />
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 text-xs font-medium hover:opacity-90 transition-opacity w-full justify-center"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar WhatsApp al cliente
          </a>
        </>
      )}
    </div>
  );
}
