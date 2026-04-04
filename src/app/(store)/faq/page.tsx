import type { Metadata } from "next";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { getSettings } from "@/lib/queries/settings";
import { parseFaqSetting } from "@/lib/content";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Respuestas a las preguntas mas comunes sobre comprar en Najo Indumentaria.",
};

export default async function FAQPage() {
  const { map } = await getSettings();
  const faqs = parseFaqSetting(map.content_faq_items);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Preguntas frecuentes
        </h1>
        <p className="mt-3 text-gray-text">
          Encontra respuestas a las consultas mas comunes.
        </p>
      </div>

      <Accordion>
        {faqs.map((faq) => (
          <AccordionItem key={faq.question} title={faq.question}>
            <p>{faq.answer}</p>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
