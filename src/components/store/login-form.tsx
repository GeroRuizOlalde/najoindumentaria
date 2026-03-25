"use client";

import { useActionState } from "react";
import { loginCustomer, type AuthResult } from "@/lib/actions/customer-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthResult, FormData>(
    loginCustomer,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        required
        error={state.errors?.email}
      />
      <Input
        id="password"
        name="password"
        label="Contraseña"
        type="password"
        required
        error={state.errors?.password}
      />

      {state.error && (
        <p className="text-sm text-error">{state.error}</p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Iniciar sesión
      </Button>
    </form>
  );
}
