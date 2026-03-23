import { resend } from "@/lib/resend";
import { getSettings } from "@/lib/queries/settings";
import { ORDER_STATUS_LABELS, type OrderStatusType } from "@/lib/constants";
import OrderStatusUpdate from "../../../emails/order-status-update";

interface SendStatusUpdateEmailParams {
  customerName: string;
  customerEmail: string;
  orderCode: string;
  newStatus: OrderStatusType;
  note?: string;
  trackingNumber?: string;
}

export async function sendStatusUpdateEmail(
  params: SendStatusUpdateEmailParams
) {
  const { map: settings } = await getSettings();

  const senderName = settings.email_sender_name || "Najo Indumentaria";
  const senderAddress =
    settings.email_sender_address || "noreply@najoindumentaria.com";

  const statusLabel = ORDER_STATUS_LABELS[params.newStatus];

  await resend.emails.send({
    from: `${senderName} <${senderAddress}>`,
    to: params.customerEmail,
    subject: `Pedido ${params.orderCode} — ${statusLabel}`,
    react: OrderStatusUpdate({
      customerName: params.customerName,
      orderCode: params.orderCode,
      statusLabel,
      note: params.note,
      trackingNumber: params.trackingNumber,
    }),
  });
}
