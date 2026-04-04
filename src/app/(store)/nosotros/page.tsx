import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { parseMultilineSetting } from "@/lib/content";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce mas sobre Najo Indumentaria. Streetwear premium desde Argentina.",
};

const DEFAULT_PARAGRAPHS = [
  "Seleccionamos las mejores piezas de marcas internacionales como Nike, Adidas, Jordan, New Balance, Puma y Converse para ofrecerte estilo urbano con actitud y calidad garantizada.",
  "Cada producto que vendemos es 100% original. Trabajamos directamente con proveedores autorizados para asegurar la autenticidad de cada par de zapatillas y cada prenda.",
  "Creemos en la atencion personalizada. Por eso, te acompanamos en todo el proceso de compra a traves de WhatsApp, resolviendo dudas y asegurandonos de que tengas la mejor experiencia.",
  "Hacemos envios a todo el pais con seguimiento, para que puedas rastrear tu pedido en cada paso del camino.",
];

export default async function NosotrosPage() {
  const { map } = await getSettings();
  const bodyParagraphs = parseMultilineSetting(
    map.content_about_body,
    DEFAULT_PARAGRAPHS
  );

  const stats = [
    {
      value: map.content_about_stat_1_value || "100%",
      label: map.content_about_stat_1_label || "Originales",
    },
    {
      value: map.content_about_stat_2_value || "48hs",
      label: map.content_about_stat_2_label || "Despacho",
    },
    {
      value: map.content_about_stat_3_value || "Todo",
      label: map.content_about_stat_3_label || "El pais",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Nosotros</h1>
      </div>

      <div className="prose-sm space-y-6 leading-relaxed text-gray-text">
        <p className="text-lg font-medium text-black">
          {map.content_about_intro ||
            "Somos Najo Indumentaria, tu destino de streetwear premium en Argentina."}
        </p>
        {bodyParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-3 gap-8 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-heading text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-text">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
