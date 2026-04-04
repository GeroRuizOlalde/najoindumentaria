"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import {
  createBrand,
  updateBrand,
  type ActionResult,
} from "@/lib/actions/brands";
import { CldUploadWidget } from "next-cloudinary";
import { Upload } from "lucide-react";

interface BrandFormProps {
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    banner: string | null;
    description: string | null;
    sortOrder: number;
    active: boolean;
  };
  onSuccess?: () => void;
}

function ImageUploadField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-end gap-2">
        <Input
          id={id}
          name={id}
          label=""
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`URL de ${label.toLowerCase()}`}
          className="flex-1"
        />
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          options={{
            maxFiles: 1,
            sources: ["local", "url"],
            folder: "najoindumentaria/brands",
          }}
          onSuccess={(result) => {
            if (
              typeof result.info === "object" &&
              result.info &&
              "secure_url" in result.info
            ) {
              onChange((result.info as { secure_url: string }).secure_url);
            }
          }}
        >
          {({ open }) => (
            <Button type="button" variant="secondary" size="sm" onClick={() => open()}>
              <Upload className="mr-1 h-3.5 w-3.5" />
              Subir
            </Button>
          )}
        </CldUploadWidget>
      </div>

      {value && (
        <div className="h-20 w-full overflow-hidden border border-border bg-off-white p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={`${label} preview`} className="h-full w-full object-contain" />
        </div>
      )}
    </div>
  );
}

export function BrandForm({ brand, onSuccess }: BrandFormProps) {
  const [name, setName] = useState(brand?.name ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!brand);
  const [logo, setLogo] = useState(brand?.logo ?? "");
  const [banner, setBanner] = useState(brand?.banner ?? "");

  const action = brand ? updateBrand.bind(null, brand.id) : createBrand;

  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    action,
    {}
  );

  useEffect(() => {
    if (autoSlug) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <Input
        id="name"
        name="name"
        label="Nombre"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <Input
        id="slug"
        name="slug"
        label="Slug"
        value={slug}
        onChange={(event) => {
          setSlug(event.target.value);
          setAutoSlug(false);
        }}
        required
      />

      <ImageUploadField id="logo" label="Logo" value={logo} onChange={setLogo} />
      <ImageUploadField
        id="banner"
        label="Banner"
        value={banner}
        onChange={setBanner}
      />

      <Textarea
        id="description"
        name="description"
        label="Descripcion"
        defaultValue={brand?.description ?? ""}
      />

      <Input
        id="sortOrder"
        name="sortOrder"
        label="Orden"
        type="number"
        defaultValue={brand?.sortOrder ?? 0}
      />

      <div className="flex items-center gap-2">
        <input
          type="hidden"
          name="active"
          value={brand?.active !== false ? "true" : "false"}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            defaultChecked={brand?.active !== false}
            onChange={(event) => {
              const hidden = event.currentTarget.parentElement?.parentElement?.querySelector(
                'input[name="active"]'
              ) as HTMLInputElement | null;
              if (hidden) hidden.value = event.target.checked ? "true" : "false";
            }}
            className="h-4 w-4"
          />
          Activa
        </label>
      </div>

      {state.error && <p className="text-sm text-error">{state.error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isPending}>
          {brand ? "Actualizar marca" : "Crear marca"}
        </Button>
      </div>
    </form>
  );
}
