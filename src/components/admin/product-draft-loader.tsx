"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface DraftProduct {
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
  sizes: {
    sizeLabel: string;
    isAvailable: boolean;
    stock: number;
  }[];
}

interface ProductDraftLoaderProps {
  brands: Brand[];
  categories: Category[];
}

export function ProductDraftLoader({
  brands,
  categories,
}: ProductDraftLoaderProps) {
  const searchParams = useSearchParams();
  const draftKey = searchParams.get("draft");
  const row = searchParams.get("row");
  const [draft, setDraft] = useState<DraftProduct | null>(null);

  useEffect(() => {
    if (!draftKey || !row) {
      setDraft(null);
      return;
    }

    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) {
        setDraft(null);
        return;
      }

      const drafts = JSON.parse(raw) as DraftProduct[];
      const index = Number(row);
      setDraft(Number.isNaN(index) ? null : drafts[index] ?? null);
    } catch {
      setDraft(null);
    }
  }, [draftKey, row]);

  const formKey = useMemo(
    () => `${draftKey ?? "manual"}-${row ?? "base"}`,
    [draftKey, row]
  );

  return (
    <ProductForm
      key={formKey}
      brands={brands}
      categories={categories}
      initialDraft={draft}
    />
  );
}
