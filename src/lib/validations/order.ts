import { z } from "zod";

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "PAYMENT_RECEIVED",
    "CONFIRMED",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "EXPIRED",
  ]),
  note: z.string().optional(),
});

export const orderUpdateSchema = z.object({
  trackingNumber: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
});

export type OrderStatusUpdateData = z.infer<typeof orderStatusUpdateSchema>;
export type OrderUpdateData = z.infer<typeof orderUpdateSchema>;
