"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createCartReservation } from "@/lib/actions/cart-reservation";
import type { CartReservationResult } from "@/lib/actions/cart-reservation";
import { useCart } from "@/components/store/cart-provider";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PROVINCES } from "@/lib/constants";
import { ReservationSuccess } from "@/components/store/reservation-success";
import { formatPriceFromDecimal } from "@/lib/utils";
import { useEffect } from "react";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  defaultAddress?: string;
}

interface CartReservationClientProps {
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

const initialState: CartReservationResult = {};

export function CartReservationClient({
  bankDetails,
  whatsappNumber,
  customer,
}: CartReservationClientProps) {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [state, action, pending] = useActionState(
    createCartReservation,
    initialState
  );

  // Clear cart on successful reservation
  useEffect(() => {
    if (state.success) {
      clearCart();
    }
  }, [state.success, clearCart]);

  // Redirect if cart is empty and no success
  if (items.length === 0 && !state.success) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-text mb-4">Tu carrito está vacío.</p>
        <Button onClick={() => router.push("/shop")}>Ver productos</Button>
      </div>
    );
  }

  if (state.success && state.orderCode) {
    return (
      <ReservationSuccess
        orderCode={state.orderCode}
        bankDetails={bankDetails}
        whatsappNumber={whatsappNumber}
      />
    );
  }

  return (
    <>
      <h1 className="font-heading text-2xl font-bold mb-8">Completá tu reserva</h1>

      <form action={action} className="space-y-6">
        <input type="hidden" name="items" value={JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            sizeId: i.sizeId,
            sizeLabel: i.sizeLabel,
            quantity: i.quantity,
            price: i.price,
            productName: i.productName,
          }))
        )} />

        {/* Cart summary */}
        <div className="bg-off-white p-4 space-y-3">
          <p className="text-xs uppercase tracking-wider text-gray-text">
            Tu reserva ({items.length} {items.length === 1 ? "producto" : "productos"})
          </p>
          {items.map((item) => (
            <div key={`${item.productId}-${item.sizeId}`} className="flex justify-between text-sm">
              <span>
                {item.brandName} {item.productName}{" "}
                <span className="text-gray-text">
                  (Talle {item.sizeLabel} x{item.quantity})
                </span>
              </span>
              <span className="font-medium">
                {formatPriceFromDecimal(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPriceFromDecimal(totalPrice)}</span>
          </div>
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
              defaultValue={customer?.name}
              required
              error={state.errors?.name}
            />
            <Input
              name="email"
              label="Email"
              type="email"
              defaultValue={customer?.email}
              required
              error={state.errors?.email}
            />
            <Input
              name="phone"
              label="Teléfono / WhatsApp"
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

        {/* Location */}
        <div>
          <h3 className="text-sm font-medium mb-3">Ubicación</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              name="province"
              label="Provincia"
              placeholder="Seleccioná una provincia"
              defaultValue={customer?.province}
              options={PROVINCES.map((p) => ({ value: p, label: p }))}
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
                <p className="text-xs text-gray-text">Te enviamos a tu dirección</p>
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
                <p className="text-xs text-gray-text">Coordinamos la entrega</p>
              </div>
            </label>
          </div>
        </div>

        {/* Shipping address */}
        <Input
          name="address"
          label="Dirección de envío (opcional)"
          defaultValue={customer?.defaultAddress}
        />

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
    </>
  );
}
