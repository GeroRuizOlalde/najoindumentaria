import type { Metadata } from "next";
import { ContactForm } from "@/components/store/contact-form";
import { Mail, Phone, MapPin } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactá a Najo Indumentaria. Estamos para ayudarte.",
};

export default async function ContactoPage() {
  const { map: settings } = await getSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Contacto
        </h1>
        <p className="mt-3 text-gray-text">
          ¿Tenés alguna consulta? Escribinos y te respondemos a la brevedad.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium mb-6">Envianos un mensaje</h2>
          <ContactForm />
        </div>

        <div>
          <h2 className="text-sm font-medium mb-6">Información de contacto</h2>
          <div className="space-y-4">
            {settings.company_email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-text" />
                <a
                  href={`mailto:${settings.company_email}`}
                  className="text-sm hover:text-bronze transition-colors"
                >
                  {settings.company_email}
                </a>
              </div>
            )}
            {settings.company_phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-text" />
                <span className="text-sm">{settings.company_phone}</span>
              </div>
            )}
            {settings.company_address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-text" />
                <span className="text-sm">{settings.company_address}</span>
              </div>
            )}
          </div>

          {settings.whatsapp_number && (
            <div className="mt-8 bg-off-white p-6">
              <p className="text-sm font-medium">Respuesta más rápida</p>
              <p className="mt-1 text-xs text-gray-text">
                Para una respuesta inmediata, escribinos por WhatsApp.
              </p>
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-10 items-center justify-center bg-[#25D366] px-5 text-xs font-medium uppercase tracking-wider text-white hover:opacity-90 transition-opacity"
              >
                Abrir WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
