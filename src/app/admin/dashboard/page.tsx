import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
  TicketPercent,
  RefreshCw,
} from "lucide-react";
import {
  getAlerts,
  getBestWorstSellingProducts,
  getCommercialInsights,
  getDashboardStats,
  getRecentOrders,
} from "@/lib/queries/dashboard";
import { StatsCard } from "@/components/admin/stats-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatPriceFromDecimal } from "@/lib/utils";
import type { OrderStatusType } from "@/lib/constants";
import { requireAdminPermission } from "@/lib/admin-permissions";

export default async function DashboardPage() {
  await requireAdminPermission("dashboard.view");

  let stats;
  let recentOrders;
  let alerts;
  let sellingProducts;
  let insights;

  try {
    [stats, recentOrders, alerts, sellingProducts, insights] = await Promise.all([
      getDashboardStats(),
      getRecentOrders(),
      getAlerts(),
      getBestWorstSellingProducts(),
      getCommercialInsights(),
    ]);
  } catch (error) {
    console.error("Dashboard render error:", error);

    return (
      <>
        <PageHeader title="Dashboard" description="Resumen de tu tienda" />
        <div className="border border-warning/30 bg-warning/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="font-heading text-lg font-semibold">
              No se pudo cargar el dashboard
            </h2>
          </div>
          <p className="text-sm text-gray-text">
            El motivo mas probable es que la base de datos no tenga aplicado el
            esquema nuevo del proyecto.
          </p>
          <p className="mt-3 text-sm text-gray-text">
            Ejecuta sobre la misma base usada por la app:
          </p>
          <pre className="mt-3 overflow-x-auto bg-black p-4 text-xs text-white">
            <code>npx prisma db push</code>
          </pre>
          <p className="mt-3 text-sm text-gray-text">
            Si estas en Vercel, corre ese comando con la `DATABASE_URL` de
            producción y luego redeploy.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen de tu tienda" />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pedidos este mes"
          value={stats.totalOrdersThisMonth}
          icon={ShoppingBag}
        />
        <StatsCard title="Pendientes" value={stats.pendingOrders} icon={Clock} />
        <StatsCard
          title="Ingresos del mes"
          value={formatPriceFromDecimal(stats.confirmedRevenue)}
          icon={DollarSign}
        />
        <StatsCard title="Productos activos" value={stats.totalProducts} icon={Package} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Ticket promedio"
          value={formatPriceFromDecimal(insights.averageOrderValue)}
          icon={TrendingUp}
        />
        <StatsCard
          title="Clientes recurrentes"
          value={insights.repeatCustomers}
          icon={RefreshCw}
        />
        <StatsCard
          title="Pedidos con cupon"
          value={insights.couponOrders}
          icon={TicketPercent}
        />
        <StatsCard
          title="Descuentos del mes"
          value={formatPriceFromDecimal(insights.monthlyDiscounts)}
          icon={Users}
        />
      </div>

      {sellingProducts.best && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-border bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-text">
                Mas vendido
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {sellingProducts.best.images[0] && (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-off-white">
                  <Image
                    src={sellingProducts.best.images[0]}
                    alt={sellingProducts.best.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{sellingProducts.best.name}</p>
                <p className="text-xs text-gray-text">
                  {sellingProducts.best.brand.name} · {sellingProducts.best.salesCount} ventas
                </p>
              </div>
            </div>
          </div>

          {sellingProducts.worst && (
            <div className="border border-border bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-error" />
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-text">
                  Menos vendido
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {sellingProducts.worst.images[0] && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-off-white">
                    <Image
                      src={sellingProducts.worst.images[0]}
                      alt={sellingProducts.worst.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{sellingProducts.worst.name}</p>
                  <p className="text-xs text-gray-text">
                    {sellingProducts.worst.brand.name} · {sellingProducts.worst.salesCount} ventas
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(alerts.expiringOrders > 0 || alerts.outOfStockProducts > 0) && (
        <div className="mb-8 border border-warning/30 bg-warning/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Alertas</span>
          </div>
          <div className="space-y-1 text-sm text-gray-text">
            {alerts.expiringOrders > 0 && (
              <p>{alerts.expiringOrders} pedido(s) vencen en las proximas 6 horas.</p>
            )}
            {alerts.outOfStockProducts > 0 && (
              <p>{alerts.outOfStockProducts} producto(s) quedaron sin stock disponible.</p>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Top marcas</h2>
            <span className="text-xs text-gray-text">Mes actual</span>
          </div>
          {insights.topBrands.length === 0 ? (
            <p className="text-sm text-gray-text">Todavia no hay ventas para este periodo.</p>
          ) : (
            <div className="space-y-3">
              {insights.topBrands.map((brand) => (
                <div key={brand.label} className="flex items-center justify-between text-sm">
                  <span>{brand.label}</span>
                  <span className="font-medium">{brand.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Top categorias</h2>
            <span className="text-xs text-gray-text">Mes actual</span>
          </div>
          {insights.topCategories.length === 0 ? (
            <p className="text-sm text-gray-text">Todavia no hay ventas para este periodo.</p>
          ) : (
            <div className="space-y-3">
              {insights.topCategories.map((category) => (
                <div key={category.label} className="flex items-center justify-between text-sm">
                  <span>{category.label}</span>
                  <span className="font-medium">{category.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-heading text-base font-semibold">Ultimos pedidos</h2>
          <Link
            href="/admin/pedidos"
            className="text-xs font-medium text-gray-text transition-colors hover:text-black"
          >
            Ver todos
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-text">
            No hay pedidos todavia.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-off-white/50"
              >
                <div>
                  <p className="text-sm font-medium">{order.orderCode}</p>
                  <p className="text-xs text-gray-text">
                    {order.customer.name} ·{" "}
                    {order.product?.name || order.items[0]?.product.name || "Varios productos"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {formatPriceFromDecimal(Number(order.amount))}
                  </span>
                  <StatusBadge status={order.status as OrderStatusType} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
