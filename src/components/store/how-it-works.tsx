import { Search, CreditCard, Truck } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Elegí tu producto",
    description: "Navegá nuestro catálogo y elegí el producto y talle que querés.",
  },
  {
    icon: CreditCard,
    title: "Reservá y transferí",
    description:
      "Completá el formulario de reserva y transferí el monto a nuestra cuenta bancaria.",
  },
  {
    icon: Truck,
    title: "Recibí tu pedido",
    description:
      "Confirmamos tu pago y te enviamos el pedido con seguimiento.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-text mb-2">
          Simple y seguro
        </p>
        <h2 className="font-heading text-3xl font-bold tracking-tight">
          Cómo comprar
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border border-border">
              <step.icon className="h-6 w-6" />
            </div>
            <p className="mt-2 text-xs text-gray-text">Paso {i + 1}</p>
            <h3 className="mt-2 font-heading text-lg font-semibold">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-gray-text leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
