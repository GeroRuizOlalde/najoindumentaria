"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import {
  createCategory,
  updateCategory,
  type ActionResult,
} from "@/lib/actions/categories";
import { CldUploadWidget } from "next-cloudinary";
import { Upload } from "lucide-react";

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    description: string | null;
    sortOrder: number;
    active: boolean;
  };
}

export function CategoryForm({ category }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!category);
  const [image, setImage] = useState(category?.image ?? "");

  const action = category
    ? updateCategory.bind(null, category.id)
    : createCategory;

  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    action,
    {}
  );

  useEffect(() => {
    if (autoSlug) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
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
        <label className="text-sm font-medium">Imagen</label>
        <div className="flex gap-2 items-end">
          <Input
            id="image"
            name="image"
            label=""
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="URL de la imagen"
            className="flex-1"
          />
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            options={{
              maxFiles: 1,
              sources: ["local", "url"],
              folder: "najoindumentaria/categories",
            }}
            onSuccess={(result) => {
              if (
                typeof result.info === "object" &&
                result.info &&
                "secure_url" in result.info
              ) {
                setImage((result.info as { secure_url: string }).secure_url);
              }
            }}
          >
            {({ open }) => (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => open()}
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                Subir
              </Button>
            )}
          </CldUploadWidget>
        </div>
        {image && (
          <div className="h-20 w-20 border border-border p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      <Textarea
        id="description"
        name="description"
        label="Descripcion"
        defaultValue={category?.description ?? ""}
      />
      <Input
        id="sortOrder"
        name="sortOrder"
        label="Orden"
        type="number"
        defaultValue={category?.sortOrder ?? 0}
      />

      <div className="flex items-center gap-2">
        <input
          type="hidden"
          name="active"
          value={category?.active !== false ? "true" : "false"}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            defaultChecked={category?.active !== false}
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

      <Button type="submit" loading={isPending}>
        {category ? "Actualizar categoria" : "Crear categoria"}
      </Button>
    </form>
  );
}
