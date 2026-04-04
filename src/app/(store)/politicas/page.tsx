import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { parseMultilineSetting } from "@/lib/content";

export const metadata: Metadata = {
  title: "Politicas",
  description: "Politicas de compra, envio, cambios y privacidad de Najo Indumentaria.",
};

const DEFAULT_RESERVATION = [
  "Al realizar una reserva, el producto queda apartado por 48 horas.",
  "El pago se realiza exclusivamente por transferencia bancaria.",
  "Si no se recibe el comprobante de pago dentro de las 48 horas, la reserva se cancela automaticamente y el producto vuelve a estar disponible.",
  "Una vez confirmado el pago, el pedido pasa a preparacion.",
];

const DEFAULT_SHIPPING = [
  "Realizamos envios a todo el territorio argentino.",
  "Los pedidos se despachan dentro de las 24-48 horas habiles posteriores a la confirmacion del pago.",
  "El tiempo de entrega varia segun la ubicacion, generalmente entre 3 y 7 dias habiles.",
  "Todos los envios incluyen numero de seguimiento.",
];

const DEFAULT_RETURNS = [
  "Aceptamos cambios dentro de los 15 dias corridos de recibido el producto.",
  "El producto debe estar sin uso, con sus etiquetas originales y en su empaque original.",
  "Los cambios estan sujetos a disponibilidad de stock.",
  "El costo de envio del cambio corre por cuenta del comprador.",
  "No se realizan devoluciones de dinero, solo cambios por otros productos.",
];

const DEFAULT_PRIVACY = [
  "Los datos personales proporcionados se utilizan exclusivamente para gestionar tu pedido.",
  "No compartimos tu informacion con terceros.",
  "Podes solicitar la eliminacion de tus datos contactandonos por email.",
];

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function PoliticasPage() {
  const { map } = await getSettings();

  const reservationItems = parseMultilineSetting(
    map.content_policies_reservation,
    DEFAULT_RESERVATION
  );
  const shippingItems = parseMultilineSetting(
    map.content_policies_shipping,
    DEFAULT_SHIPPING
  );
  const returnsItems = parseMultilineSetting(
    map.content_policies_returns,
    DEFAULT_RETURNS
  );
  const privacyItems = parseMultilineSetting(
    map.content_policies_privacy,
    DEFAULT_PRIVACY
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="mb-12 text-center font-heading text-4xl font-bold tracking-tight">
        Politicas
      </h1>

      <div className="space-y-10 text-sm leading-relaxed text-gray-text">
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-black">
            Reserva y pago
          </h2>
          <PolicyList items={reservationItems} />
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-black">
            Envios
          </h2>
          <PolicyList items={shippingItems} />
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-black">
            Cambios y devoluciones
          </h2>
          <PolicyList items={returnsItems} />
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-black">
            Privacidad
          </h2>
          <PolicyList items={privacyItems} />
        </section>
      </div>
    </div>
  );
}
