import Link from "next/link";
import { CheckCircle2, Copy } from "lucide-react";

interface ReservationSuccessProps {
  orderCode: string;
  bankDetails: {
    bankName?: string;
    holder?: string;
    cbu?: string;
    alias?: string;
    accountType?: string;
    instructions?: string;
  };
  whatsappNumber?: string;
}

export function ReservationSuccess({
  orderCode,
  bankDetails,
  whatsappNumber,
}: ReservationSuccessProps) {
  const whatsappMessage = encodeURIComponent(
    `Hola! Acabo de hacer una reserva en Najo Indumentaria. Mi código de pedido es: ${orderCode}`
  );

  return (
    <div className="text-center max-w-lg mx-auto">
      <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
      <h2 className="mt-4 font-heading text-2xl font-bold">
        ¡Reserva confirmada!
      </h2>
      <p className="mt-2 text-sm text-gray-text">
        Tu código de pedido es:
      </p>
      <div className="mt-3 inline-flex items-center gap-2 bg-off-white px-6 py-3 font-mono text-xl font-bold tracking-wider">
        {orderCode}
      </div>

      {/* Bank details */}
      <div className="mt-8 border border-border p-6 text-left">
        <h3 className="text-sm font-medium mb-4">
          Datos para transferencia bancaria
        </h3>
        <div className="space-y-2 text-sm">
          {bankDetails.bankName && (
            <div className="flex justify-between">
              <span className="text-gray-text">Banco</span>
              <span className="font-medium">{bankDetails.bankName}</span>
            </div>
          )}
          {bankDetails.holder && (
            <div className="flex justify-between">
              <span className="text-gray-text">Titular</span>
              <span className="font-medium">{bankDetails.holder}</span>
            </div>
          )}
          {bankDetails.cbu && (
            <div className="flex justify-between">
              <span className="text-gray-text">CBU</span>
              <span className="font-mono text-xs font-medium">
                {bankDetails.cbu}
              </span>
            </div>
          )}
          {bankDetails.alias && (
            <div className="flex justify-between">
              <span className="text-gray-text">Alias</span>
              <span className="font-medium">{bankDetails.alias}</span>
            </div>
          )}
          {bankDetails.accountType && (
            <div className="flex justify-between">
              <span className="text-gray-text">Tipo</span>
              <span className="font-medium">{bankDetails.accountType}</span>
            </div>
          )}
        </div>
        {bankDetails.instructions && (
          <p className="mt-4 text-xs text-gray-text border-t border-border pt-3">
            {bankDetails.instructions}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-sm text-warning font-medium">
          Tenés 48 horas para realizar la transferencia.
        </p>
        <p className="text-xs text-gray-text">
          Una vez realizada la transferencia, envianos el comprobante por
          WhatsApp indicando tu código de pedido.
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center bg-[#25D366] px-6 text-xs font-medium uppercase tracking-wider text-white hover:opacity-90 transition-opacity"
          >
            Enviar comprobante por WhatsApp
          </a>
        )}
        <Link
          href={`/seguimiento?codigo=${orderCode}`}
          className="inline-flex h-11 items-center justify-center border border-border px-6 text-xs font-medium uppercase tracking-wider hover:border-black transition-colors"
        >
          Seguir mi pedido
        </Link>
      </div>
    </div>
  );
}
