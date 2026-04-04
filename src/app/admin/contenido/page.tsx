import { PageHeader } from "@/components/shared/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdminPermission } from "@/lib/admin-permissions";
import { getSettings } from "@/lib/queries/settings";

const HERO_FIELDS = [
  { key: "content_home_hero_eyebrow", label: "Hero eyebrow" },
  { key: "content_home_hero_title", label: "Hero titulo" },
  { key: "content_home_hero_subtitle", label: "Hero subtitulo" },
  {
    key: "content_home_hero_description",
    label: "Hero descripcion",
    type: "textarea" as const,
  },
  { key: "content_home_primary_cta_label", label: "CTA principal texto" },
  { key: "content_home_primary_cta_href", label: "CTA principal link" },
  { key: "content_home_secondary_cta_label", label: "CTA secundaria texto" },
  { key: "content_home_secondary_cta_href", label: "CTA secundaria link" },
];

const ABOUT_FIELDS = [
  { key: "content_about_intro", label: "Intro nosotros", type: "textarea" as const },
  {
    key: "content_about_body",
    label: "Parrafos nosotros",
    type: "textarea" as const,
    placeholder: "Un parrafo por linea",
  },
  { key: "content_about_stat_1_value", label: "Stat 1 valor" },
  { key: "content_about_stat_1_label", label: "Stat 1 label" },
  { key: "content_about_stat_2_value", label: "Stat 2 valor" },
  { key: "content_about_stat_2_label", label: "Stat 2 label" },
  { key: "content_about_stat_3_value", label: "Stat 3 valor" },
  { key: "content_about_stat_3_label", label: "Stat 3 label" },
];

const FAQ_FIELDS = [
  {
    key: "content_faq_items",
    label: "FAQ",
    type: "textarea" as const,
    placeholder: "Pregunta||Respuesta, una por linea",
  },
];

const POLICY_FIELDS = [
  {
    key: "content_policies_reservation",
    label: "Politicas reserva y pago",
    type: "textarea" as const,
    placeholder: "Un item por linea",
  },
  {
    key: "content_policies_shipping",
    label: "Politicas envios",
    type: "textarea" as const,
    placeholder: "Un item por linea",
  },
  {
    key: "content_policies_returns",
    label: "Politicas cambios y devoluciones",
    type: "textarea" as const,
    placeholder: "Un item por linea",
  },
  {
    key: "content_policies_privacy",
    label: "Politicas privacidad",
    type: "textarea" as const,
    placeholder: "Un item por linea",
  },
];

const CONTACT_FIELDS = [
  {
    key: "content_contact_intro",
    label: "Intro contacto",
    type: "textarea" as const,
  },
  { key: "content_contact_whatsapp_title", label: "Titulo WhatsApp" },
  {
    key: "content_contact_whatsapp_description",
    label: "Descripcion WhatsApp",
    type: "textarea" as const,
  },
  {
    key: "content_footer_tagline",
    label: "Tagline footer",
    type: "textarea" as const,
  },
];

export default async function ContentPage() {
  await requireAdminPermission("content.view");
  const { map } = await getSettings();

  const sections = [
    {
      title: "Home",
      description: "Hero principal y llamadas a la accion.",
      fields: HERO_FIELDS,
    },
    {
      title: "Nosotros",
      description: "Texto institucional y stats destacados.",
      fields: ABOUT_FIELDS,
    },
    {
      title: "FAQ",
      description: "Usa el formato Pregunta||Respuesta, una por linea.",
      fields: FAQ_FIELDS,
    },
    {
      title: "Politicas",
      description: "Cada linea se renderiza como un item de lista.",
      fields: POLICY_FIELDS,
    },
    {
      title: "Contacto y footer",
      description: "Textos de la pagina de contacto y pie del sitio.",
      fields: CONTACT_FIELDS,
    },
  ];

  return (
    <>
      <PageHeader
        title="Contenido"
        description="CMS liviano para textos comerciales e institucionales"
      />

      <div className="max-w-3xl space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardTitle>{section.title}</CardTitle>
            <p className="mt-1 text-sm text-gray-text">{section.description}</p>
            <div className="mt-4">
              <SettingsForm group="content" fields={section.fields} values={map} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
