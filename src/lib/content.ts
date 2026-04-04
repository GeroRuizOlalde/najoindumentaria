export interface FAQItem {
  question: string;
  answer: string;
}

export const DEFAULT_FAQS: FAQItem[] = [
  {
    question: "Los productos son originales?",
    answer:
      "Si, todos nuestros productos son 100% originales. Trabajamos con proveedores autorizados para garantizar la autenticidad de cada articulo.",
  },
  {
    question: "Como funciona el proceso de compra?",
    answer:
      "Elegis tu producto, completas la reserva, haces la transferencia dentro de las 48 horas y confirmamos el pedido una vez acreditado el pago.",
  },
  {
    question: "Cuanto tiempo tengo para pagar?",
    answer:
      "Tenes 48 horas desde la reserva para realizar la transferencia. Si no recibimos el pago, la reserva expira y el stock se libera automaticamente.",
  },
  {
    question: "Hacen envios a todo el pais?",
    answer:
      "Si, hacemos envios a todo el pais y tambien podes retirar en nuestro punto de entrega.",
  },
];

export function parseMultilineSetting(
  value: string | undefined,
  fallback: string[]
) {
  if (!value?.trim()) return fallback;

  const items = value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

export function serializeFaqItems(items: FAQItem[]) {
  return items.map((item) => `${item.question}||${item.answer}`).join("\n");
}

export function parseFaqSetting(
  value: string | undefined,
  fallback: FAQItem[] = DEFAULT_FAQS
) {
  if (!value?.trim()) return fallback;

  const items = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...answerParts] = line.split("||");
      return {
        question: question?.trim() || "",
        answer: answerParts.join("||").trim(),
      };
    })
    .filter((item) => item.question && item.answer);

  return items.length > 0 ? items : fallback;
}
