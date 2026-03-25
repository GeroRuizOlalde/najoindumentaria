import { resend } from "@/lib/resend";
import { getSettings } from "@/lib/queries/settings";
import { formatPriceFromDecimal, formatDateAR } from "@/lib/utils";
import ReservationConfirmation from "../../../emails/reservation-confirmation";

interface SendReservationEmailParams {
  customerName: string;
  customerEmail: string;
  orderCode: string;
  productName: string;
  brandName: string;
  sizeLabel: string;
  price: number;
  expiresAt: Date;
}

export async function sendReservationEmail(
  params: SendReservationEmailParams
) {
  const { map: settings } = await getSettings();

  const senderName = settings.email_sender_name || "Najo Indumentaria";
  const senderAddress =
    settings.email_sender_address || "noreply@najoindumentaria.com";

  await resend.emails.send({
    from: `${senderName} <${senderAddress}>`,
    to: params.customerEmail,
    subject: `Reserva confirmada — ${params.orderCode}`,
    react: ReservationConfirmation({
      customerName: params.customerName,
      orderCode: params.orderCode,
      productName: params.productName,
      brandName: params.brandName,
      sizeLabel: params.sizeLabel,
      price: formatPriceFromDecimal(params.price),
      bankName: settings.bank_name,
      bankHolder: settings.bank_holder,
      bankCbu: settings.bank_cbu,
      bankAlias: settings.bank_alias,
      bankAccountType: settings.bank_account_type,
      bankInstructions: settings.bank_instructions,
      expiresAt: formatDateAR(params.expiresAt, "dd/MM/yyyy HH:mm"),
      whatsappNumber: settings.whatsapp_number,
    }),
  });
}
