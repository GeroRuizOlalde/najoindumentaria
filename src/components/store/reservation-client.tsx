"use client";

import { useActionState } from "react";
import { createReservation } from "@/lib/actions/reservations";
import type { ReservationResult } from "@/lib/actions/reservations";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PROVINCES } from "@/lib/constants";
import { ReservationSuccess } from "@/components/store/reservation-success";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  defaultAddress?: string;
}

interface ReservationClientProps {
  productId: string;
  productName: string;
  productSlug: string;
  brandName: string;
  sizeId: string;
  sizeLabel: string;
  price: string;
  bankDetails: {
    bankName?: string;
    holder?: string;
    cbu?: string;
    alias?: string;
    accountType?: string;
    instructions?: string;
  };
  whatsappNumber?: string;
  customer?: CustomerData | null;
}

const initialState: ReservationResult = {};

export function ReservationClient({
  productId,
  productName,
  brandName,
  sizeId,
  sizeLabel,
  price,
  bankDetails,
  whatsappNumber,
  customer,
}: ReservationClientProps) {
  const [state, action, pending] = useActionState(
    createReservation,
    initialState
  );

  if (state.success && state.orderCode) {
    return (
      <ReservationSuccess
        orderCode={state.orderCode}
        trackingToken={state.trackingToken}
        bankDetails={bankDetails}
        whatsappNumber={whatsappNumber}
      />
    );
  }

  return (
    <>
      <h1 className="mb-8 font-heading text-2xl font-bold">Completa tu reserva</h1>

      <form action={action} className="space-y-6">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="sizeId" value={sizeId} />

        <div className="bg-off-white p-4">
          <p className="text-xs uppercase tracking-wider text-gray-text">Tu reserva</p>
          <p className="mt-1 font-medium">
            {brandName} {productName}
          </p>
          <p className="text-sm text-gray-text">
            Talle {sizeLabel} · {price}
          </p>
        </div>

        {state.error && (
          <div className="border border-error/20 bg-error/5 p-3 text-sm text-error">
            {state.error}
          </div>
        )}

        <div>
          <h3 className="mb-3 text-sm font-medium">Datos personales</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="name"
              label="Nombre completo"
              defaultValue={customer?.name}
              required
              error={state.errors?.name}
            />
            <Input
              name="email"
              label="Email"
              type="email"
              defaultValue={customer?.email}
              readOnly={!!customer?.email}
              required
              error={state.errors?.email}
            />
            <Input
              name="phone"
              label="Telefono / WhatsApp"
              defaultValue={customer?.phone}
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

        <div>
          <h3 className="mb-3 text-sm font-medium">Ubicacion</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              name="province"
              label="Provincia"
              placeholder="Selecciona una provincia"
              defaultValue={customer?.province}
              options={PROVINCES.map((province) => ({
                value: province,
                label: province,
              }))}
              error={state.errors?.province}
            />
            <Input
              name="city"
              label="Ciudad"
              defaultValue={customer?.city}
              required
              error={state.errors?.city}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Metodo de entrega</h3>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3 border border-border p-3 transition-colors hover:border-black">
              <input
                type="radio"
                name="deliveryMethod"
                value="SHIPPING"
                defaultChecked
                className="accent-black"
              />
              <div>
                <p className="text-sm font-medium">Envio a domicilio</p>
                <p className="text-xs text-gray-text">Te enviamos a tu direccion</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 border border-border p-3 transition-colors hover:border-black">
              <input
                type="radio"
                name="deliveryMethod"
                value="PICKUP"
                className="accent-black"
              />
              <div>
                <p className="text-sm font-medium">Retiro en punto de entrega</p>
                <p className="text-xs text-gray-text">Coordinamos la entrega</p>
              </div>
            </label>
          </div>
        </div>

        <Input
          name="address"
          label="Direccion de envio (opcional)"
          defaultValue={customer?.defaultAddress}
        />

        <Input
          name="couponCode"
          label="Cupon (opcional)"
          placeholder="Ej: LANZAMIENTO10"
        />

        <Textarea
          name="customerNotes"
          label="Notas (opcional)"
          placeholder="Algun comentario o consulta..."
        />

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="acceptPolicies"
            value="true"
            required
            className="mt-0.5 accent-black"
          />
          <span className="text-xs leading-relaxed text-gray-text">
            Acepto las{" "}
            <a href="/politicas" target="_blank" className="underline hover:text-black">
              politicas de compra
            </a>
            . Entiendo que tengo 48 horas para realizar la transferencia o la
            reserva sera cancelada automaticamente.
          </span>
        </label>
        {state.errors?.acceptPolicies && (
          <p className="text-xs text-error">{state.errors.acceptPolicies}</p>
        )}

        <Button type="submit" loading={pending} size="lg" className="w-full">
          Confirmar reserva
        </Button>
      </form>
    </>
  );
}
