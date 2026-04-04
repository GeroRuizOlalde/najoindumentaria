import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, "El codigo debe tener al menos 3 caracteres.")
      .max(30, "El codigo es demasiado largo."),
    description: z.string().max(500).optional().nullable(),
    discountType: z.enum(["FIXED", "PERCENTAGE"]),
    value: z.number().positive("El descuento debe ser mayor a cero."),
    minAmount: z.number().nonnegative().optional().nullable(),
    maxDiscount: z.number().nonnegative().optional().nullable(),
    usageLimit: z.number().int().positive().optional().nullable(),
    active: z.boolean(),
    startsAt: z.date().optional().nullable(),
    endsAt: z.date().optional().nullable(),
  })
  .refine((data) => data.discountType !== "PERCENTAGE" || data.value <= 100, {
    message: "Un descuento porcentual no puede superar 100.",
    path: ["value"],
  })
  .refine(
    (data) => !data.startsAt || !data.endsAt || data.startsAt <= data.endsAt,
    {
      message: "La fecha de inicio no puede ser posterior a la fecha de fin.",
      path: ["endsAt"],
    }
  );
