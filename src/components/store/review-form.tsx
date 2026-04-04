"use client";

import { useActionState } from "react";
import { submitProductReview, type ReviewActionResult } from "@/lib/actions/reviews";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReviewFormProps {
  productId: string;
  productSlug: string;
  existingReview?: {
    rating: number;
    title: string | null;
    content: string;
    status: string;
  } | null;
}

const initialState: ReviewActionResult = {};

export function ReviewForm({
  productId,
  productSlug,
  existingReview,
}: ReviewFormProps) {
  const [state, action, pending] = useActionState(
    submitProductReview,
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="rating"
          label="Puntaje"
          defaultValue={String(existingReview?.rating || 5)}
          options={[
            { value: "5", label: "5 estrellas" },
            { value: "4", label: "4 estrellas" },
            { value: "3", label: "3 estrellas" },
            { value: "2", label: "2 estrellas" },
            { value: "1", label: "1 estrella" },
          ]}
        />
        <Input
          name="title"
          label="Titulo"
          defaultValue={existingReview?.title || ""}
          placeholder="Resumen breve"
        />
      </div>

      <Textarea
        name="content"
        label="Reseña"
        defaultValue={existingReview?.content || ""}
        placeholder="Conta como te fue con el producto."
        required
      />

      {existingReview && (
        <p className="text-xs text-gray-text">
          Estado actual: {existingReview.status.toLowerCase()}.
          Al editarla vuelve a revision.
        </p>
      )}

      {state.error && <p className="text-sm text-error">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-success">
          Reseña enviada. Queda pendiente de revision.
        </p>
      )}

      <Button type="submit" loading={pending}>
        {existingReview ? "Actualizar reseña" : "Enviar reseña"}
      </Button>
    </form>
  );
}
