"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  createCoupon,
  updateCoupon,
  type CouponActionResult,
} from "@/lib/actions/coupons";

interface CouponFormProps {
  coupon?: {
    id: string;
    code: string;
    description: string | null;
    discountType: "FIXED" | "PERCENTAGE";
    value: unknown;
    minAmount: unknown | null;
    maxDiscount: unknown | null;
    usageLimit: number | null;
    active: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  };
}

function formatDateTimeLocal(value: Date | null) {
  if (!value) return "";

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CouponForm({ coupon }: CouponFormProps) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [activeValue, setActiveValue] = useState(coupon?.active !== false ? "true" : "false");

  const action = coupon ? updateCoupon.bind(null, coupon.id) : createCoupon;
  const [state, formAction, isPending] = useActionState<CouponActionResult, FormData>(
    action,
    {}
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="code"
          name="code"
          label="Codigo"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          required
        />
        <Select
          id="discountType"
          name="discountType"
          label="Tipo de descuento"
          defaultValue={coupon?.discountType ?? "FIXED"}
          options={[
            { value: "FIXED", label: "Monto fijo" },
            { value: "PERCENTAGE", label: "Porcentaje" },
          ]}
        />
      </div>

      <Textarea
        id="description"
        name="description"
        label="Descripcion"
        defaultValue={coupon?.description ?? ""}
        placeholder="Uso interno o copy breve para el equipo."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="value"
          name="value"
          type="number"
          step="0.01"
          min="0"
          label="Valor"
          defaultValue={coupon ? String(Number(coupon.value)) : ""}
          required
        />
        <Input
          id="usageLimit"
          name="usageLimit"
          type="number"
          min="1"
          label="Limite de usos"
          defaultValue={coupon?.usageLimit ?? ""}
          placeholder="Opcional"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="minAmount"
          name="minAmount"
          type="number"
          step="0.01"
          min="0"
          label="Compra minima"
          defaultValue={
            coupon?.minAmount !== null && coupon?.minAmount !== undefined
              ? String(Number(coupon.minAmount))
              : ""
          }
          placeholder="Opcional"
        />
        <Input
          id="maxDiscount"
          name="maxDiscount"
          type="number"
          step="0.01"
          min="0"
          label="Tope de descuento"
          defaultValue={
            coupon?.maxDiscount !== null && coupon?.maxDiscount !== undefined
              ? String(Number(coupon.maxDiscount))
              : ""
          }
          placeholder="Opcional"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="startsAt"
          name="startsAt"
          type="datetime-local"
          label="Inicio"
          defaultValue={formatDateTimeLocal(coupon?.startsAt ?? null)}
        />
        <Input
          id="endsAt"
          name="endsAt"
          type="datetime-local"
          label="Fin"
          defaultValue={formatDateTimeLocal(coupon?.endsAt ?? null)}
        />
      </div>

      <div className="flex items-center gap-3">
        <input type="hidden" name="active" value={activeValue} />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activeValue === "true"}
            onChange={(event) =>
              setActiveValue(event.target.checked ? "true" : "false")
            }
            className="h-4 w-4"
          />
          Activo
        </label>
      </div>

      {state.error && <p className="text-sm text-error">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" loading={isPending}>
          {coupon ? "Guardar cambios" : "Crear cupon"}
        </Button>
      </div>
    </form>
  );
}
