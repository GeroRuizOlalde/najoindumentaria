"use client";

import { useActionState } from "react";
import { addAddress, type AddressResult } from "@/lib/actions/customer-addresses";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PROVINCES } from "@/lib/constants";

export function AddressForm() {
  const [state, formAction, isPending] = useActionState<AddressResult, FormData>(
    addAddress,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <Input id="label" name="label" label="Nombre (ej: Casa, Trabajo)" required />
      <Input id="address" name="address" label="Dirección" required />
      <div className="grid grid-cols-2 gap-4">
        <Input id="city" name="city" label="Ciudad" required />
        <Select
          id="province"
          name="province"
          label="Provincia"
          placeholder="Seleccioná"
          options={PROVINCES.map((p) => ({ value: p, label: p }))}
          required
        />
      </div>
      <Input id="zipCode" name="zipCode" label="Código postal (opcional)" />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" value="true" className="h-4 w-4" />
        Dirección por defecto
      </label>

      {state.error && <p className="text-sm text-error">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Dirección guardada</p>}

      <Button type="submit" loading={isPending}>
        Guardar dirección
      </Button>
    </form>
  );
}
