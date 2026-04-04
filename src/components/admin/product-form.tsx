"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import {
  createProduct,
  updateProduct,
  type ActionResult,
} from "@/lib/actions/products";
import { COMMON_SHOE_SIZES, COMMON_CLOTHING_SIZES } from "@/lib/constants";
import { X, Plus, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Size {
  sizeLabel: string;
  isAvailable: boolean;
  stock: number;
}

interface ProductFormProps {
  brands: Brand[];
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    brandId: string;
    categoryId: string;
    price: number;
    compareAtPrice: number | null;
    description: string;
    shortDescription: string | null;
    images: string[];
    status: string;
    featured: boolean;
    sortOrder: number;
    metaTitle: string | null;
    metaDescription: string | null;
    sizes: Size[];
  };
}

export function ProductForm({ brands, categories, product }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!product);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [sizes, setSizes] = useState<Size[]>(product?.sizes ?? []);
  const [sizePreset, setSizePreset] = useState<"shoe" | "clothing" | "custom">(
    "shoe"
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const action = product ? updateProduct.bind(null, product.id) : createProduct;

  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    action,
    {}
  );

  useEffect(() => {
    if (autoSlug) setSlug(slugify(name));
  }, [name, autoSlug]);

  function addImage() {
    if (newImageUrl && !images.includes(newImageUrl)) {
      setImages([...images, newImageUrl]);
      setNewImageUrl("");
    }
  }

  function removeImage(url: string) {
    setImages(images.filter((image) => image !== url));
  }

  function loadSizePreset(preset: "shoe" | "clothing") {
    const presetSizes =
      preset === "shoe" ? COMMON_SHOE_SIZES : COMMON_CLOTHING_SIZES;

    setSizes(
      presetSizes.map((size) => ({
        sizeLabel: size,
        isAvailable: true,
        stock: 1,
      }))
    );
    setSizePreset(preset);
  }

  function toggleSize(index: number) {
    const updated = [...sizes];
    updated[index].isAvailable = !updated[index].isAvailable;

    if (!updated[index].isAvailable) {
      updated[index].stock = 0;
    } else if (updated[index].stock === 0) {
      updated[index].stock = 1;
    }

    setSizes(updated);
  }

  function updateSizeStock(index: number, stock: number) {
    const updated = [...sizes];
    updated[index].stock = Math.max(0, stock);
    updated[index].isAvailable = updated[index].stock > 0;
    setSizes(updated);
  }

  function addCustomSize() {
    const label = prompt("IngresÃ¡ el talle:");
    if (label && !sizes.find((size) => size.sizeLabel === label)) {
      setSizes([...sizes, { sizeLabel: label, isAvailable: true, stock: 1 }]);
    }
  }

  function removeSize(index: number) {
    setSizes(sizes.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />
      <input
        type="hidden"
        name="featured"
        value={featured ? "true" : "false"}
      />

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">
          InformaciÃ³n bÃ¡sica
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="name"
            name="name"
            label="Nombre del producto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="slug"
            name="slug"
            label="Slug (URL)"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            id="brandId"
            name="brandId"
            label="Marca"
            placeholder="SeleccionÃ¡ una marca"
            defaultValue={product?.brandId}
            options={brands.map((brand) => ({
              value: brand.id,
              label: brand.name,
            }))}
            required
          />
          <Select
            id="categoryId"
            name="categoryId"
            label="CategorÃ­a"
            placeholder="SeleccionÃ¡ una categorÃ­a"
            defaultValue={product?.categoryId}
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="price"
            name="price"
            label="Precio"
            type="number"
            step="0.01"
            defaultValue={product?.price}
            required
          />
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            label="Precio anterior (opcional)"
            type="number"
            step="0.01"
            defaultValue={product?.compareAtPrice ?? ""}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">DescripciÃ³n</h2>
        <Input
          id="shortDescription"
          name="shortDescription"
          label="DescripciÃ³n corta (max 300 caracteres)"
          defaultValue={product?.shortDescription ?? ""}
          maxLength={300}
        />
        <Textarea
          id="description"
          name="description"
          label="DescripciÃ³n completa"
          defaultValue={product?.description ?? ""}
          required
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">ImÃ¡genes</h2>
        <div className="flex gap-2 flex-wrap">
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            options={{
              maxFiles: 5,
              sources: ["local", "url", "camera"],
              folder: "najoindumentaria/products",
              multiple: true,
            }}
            onSuccess={(result) => {
              if (
                typeof result.info === "object" &&
                result.info &&
                "secure_url" in result.info
              ) {
                setImages((prev) => [
                  ...prev,
                  (result.info as { secure_url: string }).secure_url,
                ]);
              }
            }}
          >
            {({ open }) => (
              <Button type="button" variant="secondary" onClick={() => open()}>
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Subir imagen
              </Button>
            )}
          </CldUploadWidget>
          <div className="flex gap-2 flex-1 min-w-0">
            <Input
              id="newImage"
              label=""
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="O pegÃ¡ una URL..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addImage}
              className="self-end"
            >
              Agregar URL
            </Button>
          </div>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url, index) => (
              <div key={url} className="relative group border border-border p-1">
                <div className="h-20 w-20 bg-off-white flex items-center justify-center text-xs text-gray-text overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Imagen ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -top-2 -right-2 bg-error text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Talles</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={sizePreset === "shoe" ? "primary" : "outline"}
            size="sm"
            onClick={() => loadSizePreset("shoe")}
          >
            Calzado
          </Button>
          <Button
            type="button"
            variant={sizePreset === "clothing" ? "primary" : "outline"}
            size="sm"
            onClick={() => loadSizePreset("clothing")}
          >
            Ropa
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addCustomSize}
          >
            <Plus className="h-3 w-3 mr-1" /> Custom
          </Button>
        </div>
        {sizes.length > 0 && (
          <div className="space-y-2">
            {sizes.map((size, index) => (
              <div
                key={size.sizeLabel}
                className="grid grid-cols-[minmax(0,1fr)_110px_auto] items-center gap-3 border border-border px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => toggleSize(index)}
                  className={`text-sm font-medium text-left transition-colors ${
                    size.isAvailable
                      ? "text-black"
                      : "text-gray-light line-through"
                  }`}
                >
                  {size.sizeLabel}
                </button>
                <Input
                  label=""
                  type="number"
                  min="0"
                  value={size.stock}
                  onChange={(e) =>
                    updateSizeStock(index, parseInt(e.target.value || "0"))
                  }
                  className="py-1.5"
                />
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="text-gray-light hover:text-error"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">
          Estado y visibilidad
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            id="status"
            name="status"
            label="Estado"
            defaultValue={product?.status ?? "DRAFT"}
            options={[
              { value: "DRAFT", label: "Borrador" },
              { value: "ACTIVE", label: "Activo" },
              { value: "ARCHIVED", label: "Archivado" },
            ]}
          />
          <Input
            id="sortOrder"
            name="sortOrder"
            label="Orden"
            type="number"
            defaultValue={product?.sortOrder ?? 0}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4"
          />
          Producto destacado
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">SEO</h2>
        <Input
          id="metaTitle"
          name="metaTitle"
          label="Meta tÃ­tulo (max 70)"
          defaultValue={product?.metaTitle ?? ""}
          maxLength={70}
        />
        <Input
          id="metaDescription"
          name="metaDescription"
          label="Meta descripciÃ³n (max 160)"
          defaultValue={product?.metaDescription ?? ""}
          maxLength={160}
        />
      </section>

      {state.error && <p className="text-sm text-error">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" size="lg" loading={isPending}>
          {product ? "Actualizar producto" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
