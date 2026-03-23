"use client";

import { useActionState } from "react";
import { updateSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SettingsFormProps {
  group: string;
  fields: {
    key: string;
    label: string;
    type?: "text" | "textarea";
    placeholder?: string;
  }[];
  values: Record<string, string>;
}

export function SettingsForm({ group, fields, values }: SettingsFormProps) {
  const [state, action, pending] = useActionState(updateSettings, {
    success: false,
  });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="group" value={group} />
      {fields.map((field) =>
        field.type === "textarea" ? (
          <Textarea
            key={field.key}
            name={`setting_${field.key}`}
            label={field.label}
            placeholder={field.placeholder}
            defaultValue={values[field.key] || ""}
          />
        ) : (
          <Input
            key={field.key}
            name={`setting_${field.key}`}
            label={field.label}
            placeholder={field.placeholder}
            defaultValue={values[field.key] || ""}
          />
        )
      )}

      {state.error && (
        <p className="text-sm text-error">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-success">Guardado correctamente</p>
      )}

      <Button type="submit" loading={pending}>
        Guardar cambios
      </Button>
    </form>
  );
}
