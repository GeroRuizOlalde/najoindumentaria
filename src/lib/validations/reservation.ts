import { z } from "zod";

export const reservationSchema = z.object({
  productId: z.string().min(1),
  sizeId: z.string().min(1, "Selecciona un talle"),
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email invalido"),
  phone: z.string().min(8, "Telefono requerido"),
  province: z.string().min(1, "Provincia requerida"),
  city: z.string().min(1, "Ciudad requerida"),
  address: z.string().optional().nullable(),
  deliveryMethod: z.enum(["SHIPPING", "PICKUP"]),
  preferredContact: z.enum(["WHATSAPP", "EMAIL"]).default("WHATSAPP"),
  customerNotes: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  acceptPolicies: z.literal(true, {
    error: "Debes aceptar las politicas",
  }),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
