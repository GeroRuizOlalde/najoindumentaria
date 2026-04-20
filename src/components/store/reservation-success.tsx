"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Check } from "lucide-react";
import { formatPriceFromDecimal } from "@/lib/utils";

interface CryptoDetails {
  enabled: boolean;
  usdtAddress?: string;
  network?: string;
  instructions?: string;
}

interface ReservationSuccessProps {
  orderCode: string;
  trackingToken?: string;
  bankDetails: {
    bankName?: string;
    holder?: string;
    cbu?: string;
    alias?: string;
    accountType?: string;
    instructions?: string;
  };
  cryptoDetails?: CryptoDetails;
  whatsappNumber?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  couponCode?: string;
}

type PaymentTab = "bank" | "crypto";

interface UsdtRateResponse {
  rate: number;
  source: string;
  fetchedAt: number;
  stale?: boolean;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 text-gray-text hover:text-black transition-colors"
      aria-label="Copiar"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function ReservationSuccess({
  orderCode,
  trackingToken,
  bankDetails,
  cryptoDetails,
  whatsappNumber,
  subtotalAmount,
  discountAmount,
  totalAmount,
  couponCode,
}: ReservationSuccessProps) {
  const cryptoAvailable = Boolean(
    cryptoDetails?.enabled && cryptoDetails.usdtAddress
  );

  const [tab, setTab] = useState<PaymentTab>("bank");
  const [rate, setRate] = useState<UsdtRateResponse | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "crypto" || !cryptoAvailable || rate) return;
    let cancelled = false;
    setRateLoading(true);
    setRateError(null);
    fetch("/api/usdt-rate")
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudo obtener la cotización.");
        return (await res.json()) as UsdtRateResponse;
      })
      .then((data) => {
        if (!cancelled) setRate(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setRateError(err.message);
      })
      .finally(() => {
        if (!cancelled) setRateLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, cryptoAvailable, rate]);

  const usdtAmount =
    rate && totalAmount && rate.rate > 0 ? totalAmount / rate.rate : null;

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

      {totalAmount !== undefined && (
        <div className="mt-6 border border-border p-4 text-left text-sm space-y-2">
          {subtotalAmount !== undefined && discountAmount !== undefined && discountAmount > 0 && (
            <>
              <div className="flex justify-between text-gray-text">
                <span>Subtotal</span>
                <span>{formatPriceFromDecimal(subtotalAmount)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>
                  Descuento{couponCode ? ` (${couponCode})` : ""}
                </span>
                <span>-{formatPriceFromDecimal(discountAmount)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
                <span>Total a transferir</span>
                <span>{formatPriceFromDecimal(totalAmount)}</span>
              </div>
            </>
          )}
          {(discountAmount === undefined || discountAmount === 0) && (
            <div className="flex justify-between font-semibold text-base">
              <span>Total a transferir</span>
              <span>{formatPriceFromDecimal(totalAmount)}</span>
            </div>
          )}
        </div>
      )}

      {cryptoAvailable && (
        <div className="mt-8 grid grid-cols-2 border border-border">
          <button
            type="button"
            onClick={() => setTab("bank")}
            className={`py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
              tab === "bank"
                ? "bg-black text-white"
                : "bg-white text-gray-text hover:text-black"
            }`}
          >
            Transferencia
          </button>
          <button
            type="button"
            onClick={() => setTab("crypto")}
            className={`py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
              tab === "crypto"
                ? "bg-black text-white"
                : "bg-white text-gray-text hover:text-black"
            }`}
          >
            Criptomoneda
          </button>
        </div>
      )}

      {tab === "bank" && (
        <div className={`${cryptoAvailable ? "mt-0 border-t-0" : "mt-8"} border border-border p-6 text-left`}>
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
              <div className="flex justify-between items-center">
                <span className="text-gray-text">CBU</span>
                <span className="font-mono text-xs font-medium inline-flex items-center gap-2">
                  {bankDetails.cbu}
                  <CopyButton value={bankDetails.cbu} />
                </span>
              </div>
            )}
            {bankDetails.alias && (
              <div className="flex justify-between items-center">
                <span className="text-gray-text">Alias</span>
                <span className="font-medium inline-flex items-center gap-2">
                  {bankDetails.alias}
                  <CopyButton value={bankDetails.alias} />
                </span>
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
      )}

      {tab === "crypto" && cryptoAvailable && cryptoDetails && (
        <div className="mt-0 border border-t-0 border-border p-6 text-left">
          <h3 className="text-sm font-medium mb-4">
            Pago con USDT
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-text">Moneda</span>
              <span className="font-medium">USDT</span>
            </div>
            {cryptoDetails.network && (
              <div className="flex justify-between">
                <span className="text-gray-text">Red</span>
                <span className="font-medium">{cryptoDetails.network}</span>
              </div>
            )}
            {cryptoDetails.usdtAddress && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-text">Dirección</span>
                  <CopyButton value={cryptoDetails.usdtAddress} />
                </div>
                <span className="font-mono text-xs break-all bg-off-white p-2 border border-border">
                  {cryptoDetails.usdtAddress}
                </span>
              </div>
            )}

            <div className="border-t border-border pt-3 mt-3 space-y-2">
              {rateLoading && (
                <p className="text-xs text-gray-text">
                  Obteniendo cotización USDT/ARS…
                </p>
              )}
              {rateError && !rate && (
                <p className="text-xs text-error">
                  {rateError} Podés reintentar volviendo a abrir la pestaña.
                </p>
              )}
              {rate && (
                <>
                  <div className="flex justify-between text-xs text-gray-text">
                    <span>Cotización</span>
                    <span>
                      1 USDT ≈ {formatPriceFromDecimal(rate.rate)}
                      {rate.stale ? " (caché)" : ""}
                    </span>
                  </div>
                  {usdtAmount !== null && (
                    <div className="flex justify-between font-semibold text-base pt-1">
                      <span>Total en USDT</span>
                      <span>{usdtAmount.toFixed(2)} USDT</span>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-text">
                    Fuente: {rate.source}. La cotización se actualiza cada 5 minutos; enviá el monto exacto al momento de la transferencia.
                  </p>
                </>
              )}
            </div>
          </div>
          {cryptoDetails.instructions && (
            <p className="mt-4 text-xs text-gray-text border-t border-border pt-3">
              {cryptoDetails.instructions}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-3">
        <p className="text-sm text-warning font-medium">
          Tenés 48 horas para realizar {tab === "crypto" ? "el pago" : "la transferencia"}.
        </p>
        <p className="text-xs text-gray-text">
          Una vez realizado el pago, envianos el comprobante {tab === "crypto" ? "o hash de la transacción " : ""}por WhatsApp indicando tu código de pedido.
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
          href={
            trackingToken
              ? `/seguimiento?codigo=${encodeURIComponent(orderCode)}&token=${encodeURIComponent(trackingToken)}`
              : `/seguimiento?codigo=${encodeURIComponent(orderCode)}`
          }
          className="inline-flex h-11 items-center justify-center border border-border px-6 text-xs font-medium uppercase tracking-wider hover:border-black transition-colors"
        >
          Seguir mi pedido
        </Link>
      </div>
    </div>
  );
}
