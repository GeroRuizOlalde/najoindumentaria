import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Políticas",
  description: "Políticas de compra, envío, cambios y privacidad de Najo Indumentaria.",
};

export default function PoliticasPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold tracking-tight mb-12 text-center">
        Políticas
      </h1>

      <div className="space-y-10 text-sm text-gray-text leading-relaxed">
        <section>
          <h2 className="font-heading text-lg font-semibold text-black mb-3">
            Reserva y pago
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Al realizar una reserva, el producto queda apartado por 48 horas.
            </li>
            <li>
              El pago se realiza exclusivamente por transferencia bancaria.
            </li>
            <li>
              Si no se recibe el comprobante de pago dentro de las 48 horas, la
              reserva se cancela automáticamente y el producto vuelve a estar
              disponible.
            </li>
            <li>
              Una vez confirmado el pago, el pedido pasa a preparación.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-black mb-3">
            Envíos
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Realizamos envíos a todo el territorio argentino.
            </li>
            <li>
              Los pedidos se despachan dentro de las 24-48 horas hábiles
              posteriores a la confirmación del pago.
            </li>
            <li>
              El tiempo de entrega varía según la ubicación (generalmente 3-7
              días hábiles).
            </li>
            <li>
              Todos los envíos incluyen número de seguimiento.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-black mb-3">
            Cambios y devoluciones
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Aceptamos cambios dentro de los 15 días corridos de recibido el
              producto.
            </li>
            <li>
              El producto debe estar sin uso, con sus etiquetas originales y en
              su empaque original.
            </li>
            <li>
              Los cambios están sujetos a disponibilidad de stock.
            </li>
            <li>
              El costo de envío del cambio corre por cuenta del comprador.
            </li>
            <li>
              No se realizan devoluciones de dinero, solo cambios por otros
              productos.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-black mb-3">
            Privacidad
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Los datos personales proporcionados se utilizan exclusivamente
              para gestionar tu pedido.
            </li>
            <li>
              No compartimos tu información con terceros.
            </li>
            <li>
              Podés solicitar la eliminación de tus datos contactándonos por
              email.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
