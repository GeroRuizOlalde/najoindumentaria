import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conocé más sobre Najo Indumentaria. Streetwear premium desde Argentina.",
};

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Nosotros
        </h1>
      </div>

      <div className="prose-sm space-y-6 text-gray-text leading-relaxed">
        <p className="text-lg text-black font-medium">
          Somos Najo Indumentaria — tu destino de streetwear premium en
          Argentina.
        </p>
        <p>
          Seleccionamos las mejores piezas de marcas internacionales como Nike,
          Adidas, Jordan, New Balance, Puma y Converse para ofrecerte estilo
          urbano con actitud y calidad garantizada.
        </p>
        <p>
          Cada producto que vendemos es 100% original. Trabajamos directamente
          con proveedores autorizados para asegurar la autenticidad de cada
          par de zapatillas y cada prenda.
        </p>
        <p>
          Creemos en la atención personalizada. Por eso, te acompañamos en
          todo el proceso de compra a través de WhatsApp, resolviendo dudas
          y asegurándonos de que tengas la mejor experiencia.
        </p>
        <p>
          Hacemos envíos a todo el país con seguimiento, para que puedas
          rastrear tu pedido en cada paso del camino.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-8 text-center">
        <div>
          <p className="font-heading text-3xl font-bold">100%</p>
          <p className="mt-1 text-xs text-gray-text uppercase tracking-wider">
            Originales
          </p>
        </div>
        <div>
          <p className="font-heading text-3xl font-bold">48hs</p>
          <p className="mt-1 text-xs text-gray-text uppercase tracking-wider">
            Despacho
          </p>
        </div>
        <div>
          <p className="font-heading text-3xl font-bold">Todo</p>
          <p className="mt-1 text-xs text-gray-text uppercase tracking-wider">
            El país
          </p>
        </div>
      </div>
    </div>
  );
}
