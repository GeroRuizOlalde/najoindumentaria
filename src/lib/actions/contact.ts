"use server";

import { z } from "zod";
import { resend } from "@/lib/resend";
import { getSettings } from "@/lib/queries/settings";

type ContactResult = { success?: boolean; error?: string };

const contactSchema = z.object({
  name: z.string().min(2, "Completa tu nombre."),
  email: z.string().email("Ingresa un email valido."),
  message: z.string().min(10, "Escribe un mensaje mas completo."),
});

export async function sendContactMessage(
  _prev: ContactResult,
  formData: FormData
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Completa todos los campos." };
  }

  try {
    const { map: settings } = await getSettings();
    const senderName = settings.email_sender_name || "Najo Indumentaria";
    const senderAddress =
      settings.email_sender_address || "noreply@najoindumentaria.com";
    const destination = settings.company_email || senderAddress;

    await resend.emails.send({
      from: `${senderName} <${senderAddress}>`,
      to: destination,
      replyTo: parsed.data.email,
      subject: `Nuevo mensaje de contacto - ${parsed.data.name}`,
      text: `Nombre: ${parsed.data.name}\nEmail: ${parsed.data.email}\n\n${parsed.data.message}`,
    });

    return { success: true };
  } catch {
    return { error: "No se pudo enviar el mensaje. Intenta nuevamente." };
  }
}
