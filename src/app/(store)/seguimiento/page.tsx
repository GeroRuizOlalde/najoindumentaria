import type { Metadata } from "next";
import { getOrderByCode } from "@/lib/queries/orders";
import { ORDER_STATUS_LABELS, type OrderStatusType } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TrackingSearch } from "@/components/store/tracking-search";

export const metadata: Metadata = {
  title: "Seguimiento de pedido",
  description: "Consultá el estado de tu pedido en Najo Indumentaria.",
};

interface Props {
  searchParams: Promise<{ codigo?: string }>;
}

export default async function SeguimientoPage({ searchParams }: Props) {
  const params = await searchParams;
  const code = params.codigo?.trim().toUpperCase();

  const order = code ? await getOrderByCode(code) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Seguimiento
        </h1>
        <p className="mt-3 text-gray-text">
          Ingresá tu código de pedido para ver el estado.
        </p>
      </div>

      <TrackingSearch initialCode={code} />

      {code && !order && (
        <div className="mt-8 bg-error/5 border border-error/20 p-4 text-center">
          <p className="text-sm text-error">
            No encontramos un pedido con el código &quot;{code}&quot;.
          </p>
          <p className="text-xs text-gray-text mt-1">
            Revisá que el código esté bien escrito. Ejemplo: NAJO-A1B2C3
          </p>
        </div>
      )}

      {order && (
        <div className="mt-8 border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-text">Pedido</p>
              <p className="font-mono text-lg font-bold">{order.orderCode}</p>
            </div>
            <StatusBadge status={order.status as OrderStatusType} />
          </div>

          <div className="bg-off-white p-4 mb-6">
            <p className="font-medium text-sm">
              {order.product.brand.name} {order.product.name}
            </p>
            <p className="text-xs text-gray-text mt-0.5">
              Talle {order.sizeLabel}
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-text">
              Historial
            </p>
            {order.statusHistory.map((entry, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-black" />
                  {i < order.statusHistory.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium">
                    {ORDER_STATUS_LABELS[entry.toStatus as OrderStatusType]}
                  </p>
                  {entry.note && (
                    <p className="text-xs text-gray-text mt-0.5">
                      {entry.note}
                    </p>
                  )}
                  <p className="text-xs text-gray-light mt-0.5">
                    {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
