import { getSettings } from "@/lib/queries/settings";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";

const BANK_FIELDS = [
  { key: "bank_name", label: "Banco" },
  { key: "bank_holder", label: "Titular" },
  { key: "bank_cbu", label: "CBU" },
  { key: "bank_alias", label: "Alias" },
  { key: "bank_account_type", label: "Tipo de cuenta", placeholder: "Ej: Caja de ahorro en pesos" },
  { key: "bank_instructions", label: "Instrucciones adicionales", type: "textarea" as const },
];

const COMPANY_FIELDS = [
  { key: "company_name", label: "Nombre de la empresa" },
  { key: "company_email", label: "Email" },
  { key: "company_phone", label: "Teléfono" },
  { key: "company_address", label: "Dirección" },
  { key: "company_cuit", label: "CUIT" },
];

const SOCIAL_FIELDS = [
  { key: "instagram_url", label: "Instagram URL" },
  { key: "tiktok_url", label: "TikTok URL" },
  { key: "whatsapp_number", label: "WhatsApp (con código de país)", placeholder: "5491123456789" },
];

const EMAIL_FIELDS = [
  { key: "email_sender_name", label: "Nombre del remitente" },
  { key: "email_sender_address", label: "Email del remitente" },
];

const ARCHIVE_FIELDS = [
  { key: "archive_days_after_completion", label: "Días para auto-archivar", placeholder: "7" },
];

export default async function SettingsPage() {
  const { map } = await getSettings();

  const sections = [
    { title: "Datos bancarios", description: "Se muestran al cliente cuando hace una reserva.", group: "bank", fields: BANK_FIELDS },
    { title: "Empresa", description: "Información general de la empresa.", group: "company", fields: COMPANY_FIELDS },
    { title: "Redes sociales", description: "Links a redes sociales y WhatsApp.", group: "social", fields: SOCIAL_FIELDS },
    { title: "Email", description: "Configuración del remitente de emails.", group: "email", fields: EMAIL_FIELDS },
    { title: "Archivado automático", description: "Los pedidos entregados, cancelados y expirados se archivan automáticamente después de estos días.", group: "archive", fields: ARCHIVE_FIELDS },
  ];

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Datos bancarios, empresa, redes y email"
      />

      <div className="space-y-6 max-w-2xl">
        {sections.map((section) => (
          <Card key={section.group}>
            <CardTitle>{section.title}</CardTitle>
            <p className="text-sm text-gray-text mt-1">{section.description}</p>
            <div className="mt-4">
              <SettingsForm
                group={section.group}
                fields={section.fields}
                values={map}
              />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
