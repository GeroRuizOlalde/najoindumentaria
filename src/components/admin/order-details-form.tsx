"use client";

import { useState, useTransition } from "react";
import { updateOrderDetails } from "@/lib/actions/orders";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface OrderDetailsFormProps {
  orderId: string;
  trackingNumber?: string | null;
  shippingAddress?: string | null;
  paymentProof?: string | null;
  adminNotes?: string | null;
}

export function OrderDetailsForm({
  orderId,
  trackingNumber,
  shippingAddress,
  paymentProof,
  adminNotes,
}: OrderDetailsFormProps) {
  const [formState, setFormState] = useState({
    trackingNumber: trackingNumber || "",
    shippingAddress: shippingAddress || "",
    paymentProof: paymentProof || "",
    adminNotes: adminNotes || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        startTransition(async () => {
          const result = await updateOrderDetails(orderId, {
            trackingNumber: formState.trackingNumber || null,
            shippingAddress: formState.shippingAddress || null,
            paymentProof: formState.paymentProof || null,
            adminNotes: formState.adminNotes || null,
          });

          if (result.error) {
            setError(result.error);
            return;
          }

          setSuccess(true);
        });
      }}
    >
      <Input
        id="trackingNumber"
        label="Tracking"
        value={formState.trackingNumber}
        onChange={(event) =>
          setFormState((current) => ({
            ...current,
            trackingNumber: event.target.value,
          }))
        }
      />
      <Textarea
        id="shippingAddress"
        label="Direccion de envio"
        value={formState.shippingAddress}
        onChange={(event) =>
          setFormState((current) => ({
            ...current,
            shippingAddress: event.target.value,
          }))
        }
      />
      <Input
        id="paymentProof"
        label="Comprobante de pago (URL)"
        value={formState.paymentProof}
        onChange={(event) =>
          setFormState((current) => ({
            ...current,
            paymentProof: event.target.value,
          }))
        }
      />
      <Textarea
        id="adminNotes"
        label="Notas internas"
        value={formState.adminNotes}
        onChange={(event) =>
          setFormState((current) => ({
            ...current,
            adminNotes: event.target.value,
          }))
        }
      />

      {error && <p className="text-sm text-error">{error}</p>}
      {success && <p className="text-sm text-success">Cambios guardados.</p>}

      <Button type="submit" loading={isPending}>
        Guardar datos del pedido
      </Button>
    </form>
  );
}
