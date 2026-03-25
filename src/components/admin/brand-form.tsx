"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { createBrand, updateBrand, type ActionResult } from "@/lib/actions/brands";
import { CldUploadWidget } from "next-cloudinary";
import { Upload } from "lucide-react";

interface BrandFormProps {
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    sortOrder: number;
    active: boolean;
  };
  onSuccess?: () => void;
}

export function BrandForm({ brand, onSuccess }: BrandFormProps) {
  const [name, setName] = useState(brand?.name ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!brand);
  const [logo, setLogo] = useState(brand?.logo ?? "");

  const action = brand
    ? updateBrand.bind(null, brand.id)
    : createBrand;

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
    <form action={formAction} className="space-y-4">
      <Input
        id="name"
        name="name"
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        id="slug"
        name="slug"
        label="Slug"
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
          setAutoSlug(false);
        }}
        required
      />
      <div className="space-y-2">
        <label className="text-sm font-medium">Logo</label>
        <div className="flex gap-2 items-end">
          <Input
            id="logo"
            name="logo"
            label=""
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="URL del logo"
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
              if (typeof result.info === "object" && result.info.secure_url) {
                setLogo(result.info.secure_url);
              }
            }}
          >
            {({ open }) => (
              <Button type="button" variant="secondary" size="sm" onClick={() => open()}>
                <Upload className="h-3.5 w-3.5 mr-1" />
                Subir
              </Button>
            )}
          </CldUploadWidget>
        </div>
        {logo && (
          <div className="h-16 w-16 border border-border p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="Logo preview" className="h-full w-full object-contain" />
          </div>
        )}
      </div>
      <Textarea
        id="description"
        name="description"
        label="Descripción"
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
            onChange={(e) => {
              const hidden = e.target.parentElement?.parentElement?.querySelector(
                'input[name="active"]'
              ) as HTMLInputElement;
              if (hidden) hidden.value = e.target.checked ? "true" : "false";
            }}
            className="h-4 w-4"
          />
          Activa
        </label>
      </div>

      {state.error && <p className="text-sm text-error">{state.error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isPending}>
          {brand ? "Actualizar" : "Crear marca"}
        </Button>
      </div>
    </form>
  );
}
