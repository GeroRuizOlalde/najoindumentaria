"use client";

import { useActionState } from "react";
import { registerCustomer, type AuthResult } from "@/lib/actions/customer-auth";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PROVINCES } from "@/lib/constants";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<AuthResult, FormData>(
    registerCustomer,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <Input
        id="name"
        name="name"
        label="Nombre completo"
        required
        error={state.errors?.name}
      />
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        required
        error={state.errors?.email}
      />
      <Input
        id="phone"
        name="phone"
        label="Teléfono"
        required
        error={state.errors?.phone}
      />
      <Input
        id="password"
        name="password"
        label="Contraseña"
        type="password"
        required
        error={state.errors?.password}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          id="province"
          name="province"
          label="Provincia"
          placeholder="Seleccioná"
          options={PROVINCES.map((p) => ({ value: p, label: p }))}
          required
          error={state.errors?.province}
        />
        <Input
          id="city"
          name="city"
          label="Ciudad"
          required
          error={state.errors?.city}
        />
      </div>

      {state.error && (
        <p className="text-sm text-error">{state.error}</p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Crear cuenta
      </Button>
    </form>
  );
}
