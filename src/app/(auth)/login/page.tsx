"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  );

  return (
    <div className="w-full max-w-sm px-6">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-white">
          NAJO
        </h1>
        <p className="mt-1 font-heading text-xs tracking-[0.3em] text-gray-text">
          INDUMENTARIA
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium uppercase tracking-wider text-gray-text mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-none border border-gray-text/30 bg-transparent px-4 py-3 text-sm text-white placeholder:text-gray-text/50 focus:border-white focus:outline-none transition-colors"
            placeholder="admin@najoindumentaria.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium uppercase tracking-wider text-gray-text mb-2"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-none border border-gray-text/30 bg-transparent px-4 py-3 text-sm text-white placeholder:text-gray-text/50 focus:border-white focus:outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        {state.error && (
          <p className="text-sm text-error">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-white py-3 text-sm font-medium uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
