"use client";

import { useActionState } from "react";
import { sendContactMessage } from "@/lib/actions/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, {});

  if (state.success) {
    return (
      <div className="bg-success/5 border border-success/20 p-6 text-center">
        <p className="text-sm font-medium text-success">
          ¡Mensaje enviado correctamente!
        </p>
        <p className="mt-1 text-xs text-gray-text">
          Te responderemos a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="text-sm text-error">{state.error}</p>
      )}
      <Input name="name" label="Nombre" required />
      <Input name="email" label="Email" type="email" required />
      <Textarea name="message" label="Mensaje" required />
      <Button type="submit" loading={pending}>
        Enviar mensaje
      </Button>
    </form>
  );
}
