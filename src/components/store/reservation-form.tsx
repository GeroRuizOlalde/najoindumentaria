"use client";

import { useActionState } from "react";
import { createReservation } from "@/lib/actions/reservations";
import type { ReservationResult } from "@/lib/actions/reservations";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PROVINCES } from "@/lib/constants";

interface ReservationFormProps {
  productId: string;
  sizeId: string;
  productName: string;
  brandName: string;
  sizeLabel: string;
  price: string;
}

const initialState: ReservationResult = {};

export function ReservationForm({
  productId,
  sizeId,
  productName,
  brandName,
  sizeLabel,
  price,
}: ReservationFormProps) {
  const [state, action, pending] = useActionState(
    createReservation,
    initialState
  );

  if (state.success) return null; // Parent handles success view

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="sizeId" value={sizeId} />

      {/* Product summary */}
      <div className="bg-off-white p-4">
        <p className="text-xs uppercase tracking-wider text-gray-text">
          Tu reserva
        </p>
        <p className="mt-1 font-medium">
          {brandName} {productName}
        </p>
        <p className="text-sm text-gray-text">
          Talle {sizeLabel} &middot; {price}
        </p>
      </div>

      {state.error && (
        <div className="bg-error/5 border border-error/20 p-3 text-sm text-error">
          {state.error}
        </div>
      )}

      {/* Personal info */}
      <div>
        <h3 className="text-sm font-medium mb-3">Datos personales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="name"
            label="Nombre completo"
            required
            error={state.errors?.name}
          />
          <Input
            name="email"
            label="Email"
            type="email"
            required
            error={state.errors?.email}
          />
          <Input
            name="phone"
            label="Teléfono / WhatsApp"
            required
            error={state.errors?.phone}
          />
          <Select
            name="preferredContact"
            label="Contacto preferido"
            options={[
              { value: "WHATSAPP", label: "WhatsApp" },
              { value: "EMAIL", label: "Email" },
            ]}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-medium mb-3">Ubicación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            name="province"
            label="Provincia"
            placeholder="Seleccioná una provincia"
            options={PROVINCES.map((p) => ({ value: p, label: p }))}
            error={state.errors?.province}
          />
          <Input
            name="city"
            label="Ciudad"
            required
            error={state.errors?.city}
          />
        </div>
      </div>

      {/* Delivery */}
      <div>
        <h3 className="text-sm font-medium mb-3">Método de entrega</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 border border-border p-3 cursor-pointer hover:border-black transition-colors">
            <input
              type="radio"
              name="deliveryMethod"
              value="SHIPPING"
              defaultChecked
              className="accent-black"
            />
            <div>
              <p className="text-sm font-medium">Envío a domicilio</p>
              <p className="text-xs text-gray-text">
                Te enviamos a tu dirección
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 border border-border p-3 cursor-pointer hover:border-black transition-colors">
            <input
              type="radio"
              name="deliveryMethod"
              value="PICKUP"
              className="accent-black"
            />
            <div>
              <p className="text-sm font-medium">Retiro en punto de entrega</p>
              <p className="text-xs text-gray-text">
                Coordinamos la entrega
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Shipping address */}
      <Input name="address" label="Dirección de envío (opcional)" />

      {/* Notes */}
      <Textarea
        name="customerNotes"
        label="Notas (opcional)"
        placeholder="Algún comentario o consulta..."
      />

      {/* Accept policies */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="acceptPolicies"
          value="true"
          required
          className="mt-0.5 accent-black"
        />
        <span className="text-xs text-gray-text leading-relaxed">
          Acepto las{" "}
          <a
            href="/politicas"
            target="_blank"
            className="underline hover:text-black"
          >
            políticas de compra
          </a>
          . Entiendo que tengo 48 horas para realizar la transferencia o la
          reserva será cancelada automáticamente.
        </span>
      </label>
      {state.errors?.acceptPolicies && (
        <p className="text-xs text-error">{state.errors.acceptPolicies}</p>
      )}

      <Button type="submit" loading={pending} size="lg" className="w-full">
        Confirmar reserva
      </Button>
    </form>
  );
}
