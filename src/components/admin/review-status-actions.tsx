"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteReview, updateReviewStatus } from "@/lib/actions/reviews";

interface ReviewStatusActionsProps {
  reviewId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export function ReviewStatusActions({
  reviewId,
  status,
}: ReviewStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {status !== "APPROVED" && (
          <Button
            type="button"
            size="sm"
            onClick={() =>
              startTransition(async () => {
                const result = await updateReviewStatus(reviewId, "APPROVED");
                if (result.error) setError(result.error);
              })
            }
            loading={isPending}
          >
            Aprobar
          </Button>
        )}
        {status !== "REJECTED" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              startTransition(async () => {
                const result = await updateReviewStatus(reviewId, "REJECTED");
                if (result.error) setError(result.error);
              })
            }
            loading={isPending}
          >
            Rechazar
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => setConfirmOpen(true)}
        >
          Eliminar
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-error">{error}</p>}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setError(null);
        }}
        onConfirm={() =>
          startTransition(async () => {
            const result = await deleteReview(reviewId);
            if (result.error) {
              setError(result.error);
              return;
            }
            setConfirmOpen(false);
          })
        }
        title="Eliminar reseña"
        description="La reseña se eliminara permanentemente."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={isPending}
      />
    </>
  );
}
