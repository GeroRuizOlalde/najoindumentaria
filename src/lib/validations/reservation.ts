import { z } from "zod";

export const reservationSchema = z.object({
  productId: z.string().min(1),
  sizeLabel: z.string().min(1, "Seleccioná un talle"),
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono requerido"),
  province: z.string().min(1, "Provincia requerida"),
  city: z.string().min(1, "Ciudad requerida"),
  address: z.string().optional().nullable(),
  deliveryMethod: z.enum(["SHIPPING", "PICKUP"]),
  preferredContact: z.enum(["WHATSAPP", "EMAIL"]).default("WHATSAPP"),
  customerNotes: z.string().optional().nullable(),
  acceptPolicies: z.literal(true, {
    error: "Debés aceptar las políticas",
  }),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
