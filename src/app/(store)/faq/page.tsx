import type { Metadata } from "next";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Respuestas a las preguntas más comunes sobre comprar en Najo Indumentaria.",
};

const FAQS = [
  {
    question: "¿Los productos son originales?",
    answer:
      "Sí, todos nuestros productos son 100% originales. Trabajamos con proveedores autorizados para garantizar la autenticidad de cada artículo.",
  },
  {
    question: "¿Cómo funciona el proceso de compra?",
    answer:
      "Elegís tu producto, completás el formulario de reserva, realizás una transferencia bancaria dentro de las 48 horas y te enviamos el pedido una vez confirmado el pago.",
  },
  {
    question: "¿Cuánto tiempo tengo para pagar?",
    answer:
      "Tenés 48 horas desde el momento de la reserva para realizar la transferencia bancaria. Si no se recibe el pago en ese plazo, la reserva se cancela automáticamente y el stock se libera.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer:
      "Sí, hacemos envíos a todo el país. El costo de envío se calcula según tu ubicación. También podés retirar en nuestro punto de entrega.",
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "Una vez confirmado el pago, despachamos en 24-48 horas hábiles. El tiempo de envío depende de tu ubicación, pero generalmente es de 3 a 7 días hábiles.",
  },
  {
    question: "¿Puedo hacer cambios?",
    answer:
      "Sí, aceptamos cambios dentro de los 15 días de recibido el producto, siempre que esté en las mismas condiciones en que fue entregado (sin uso, con etiquetas). Contactanos por WhatsApp para coordinar.",
  },
  {
    question: "¿Cómo puedo seguir mi pedido?",
    answer:
      "Podés seguir el estado de tu pedido en nuestra sección de Seguimiento ingresando tu código de pedido. También te enviamos actualizaciones por email.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos transferencia bancaria. Al hacer tu reserva, te enviamos los datos de nuestra cuenta para que realices la transferencia.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Preguntas frecuentes
        </h1>
        <p className="mt-3 text-gray-text">
          Encontrá respuestas a las consultas más comunes.
        </p>
      </div>

      <Accordion>
        {FAQS.map((faq) => (
          <AccordionItem key={faq.question} title={faq.question}>
            <p>{faq.answer}</p>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
