import { Shield, Star, Headphones, RefreshCw } from "lucide-react";

const BENEFITS = [
  {
    icon: Shield,
    title: "100% Originales",
    description: "Todos nuestros productos son originales y con garantía.",
  },
  {
    icon: Star,
    title: "Marcas premium",
    description: "Las mejores marcas internacionales de streetwear.",
  },
  {
    icon: Headphones,
    title: "Atención personalizada",
    description: "Te asesoramos por WhatsApp en cada paso de tu compra.",
  },
  {
    icon: RefreshCw,
    title: "Cambios",
    description: "Política de cambios para que compres tranquilo.",
  },
];

export function BenefitsSection() {
  return (
    <section className="border-t border-border bg-off-white py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <benefit.icon className="mx-auto h-6 w-6 text-bronze" />
              <h3 className="mt-3 text-sm font-medium">{benefit.title}</h3>
              <p className="mt-1 text-xs text-gray-text leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
