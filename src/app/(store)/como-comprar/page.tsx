import type { Metadata } from "next";
import { Search, CreditCard, Truck, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Cómo comprar",
  description: "Conocé el proceso paso a paso para comprar en Najo Indumentaria.",
};

const STEPS = [
  {
    icon: Search,
    number: "01",
    title: "Elegí tu producto",
    description:
      "Navegá nuestro catálogo, filtrá por categoría o marca, y elegí el producto y talle que te guste.",
  },
  {
    icon: CreditCard,
    number: "02",
    title: "Hacé tu reserva",
    description:
      "Completá el formulario con tus datos. Te vamos a enviar un email con los datos bancarios para que realices la transferencia.",
  },
  {
    icon: MessageCircle,
    number: "03",
    title: "Enviá el comprobante",
    description:
      "Una vez que hagas la transferencia, envianos el comprobante por WhatsApp junto con tu código de pedido. Tenés 48 horas desde la reserva para completar el pago.",
  },
  {
    icon: Truck,
    number: "04",
    title: "Recibí tu pedido",
    description:
      "Confirmamos tu pago, preparamos tu pedido y te lo enviamos con seguimiento. También podés retirarlo en nuestro punto de entrega.",
  },
];

export default function ComoComprarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Cómo comprar
        </h1>
        <p className="mt-3 text-gray-text">
          Comprar en Najo es simple y seguro. Seguí estos pasos:
        </p>
      </div>

      <div className="space-y-12">
        {STEPS.map((step) => (
          <div key={step.number} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-border">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="w-px flex-1 bg-border mt-2" />
            </div>
            <div className="pb-8">
              <p className="text-xs text-gray-text font-medium">
                Paso {step.number}
              </p>
              <h2 className="mt-1 font-heading text-xl font-semibold">
                {step.title}
              </h2>
              <p className="mt-2 text-sm text-gray-text leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-off-white p-6 text-center">
        <p className="text-sm font-medium">¿Tenés dudas?</p>
        <p className="mt-1 text-sm text-gray-text">
          Escribinos por WhatsApp y te ayudamos con tu compra.
        </p>
      </div>
    </div>
  );
}
