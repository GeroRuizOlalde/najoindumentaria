import { getDashboardStats, getRecentOrders, getAlerts } from "@/lib/queries/dashboard";
import { StatsCard } from "@/components/admin/stats-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatPriceFromDecimal } from "@/lib/utils";
import type { OrderStatusType } from "@/lib/constants";
import {
  Package,
  ShoppingBag,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [stats, recentOrders, alerts] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
    getAlerts(),
  ]);

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen de tu tienda" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Pedidos este mes"
          value={stats.totalOrdersThisMonth}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Pendientes"
          value={stats.pendingOrders}
          icon={Clock}
        />
        <StatsCard
          title="Ingresos del mes"
          value={formatPriceFromDecimal(stats.confirmedRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="Productos activos"
          value={stats.totalProducts}
          icon={Package}
        />
      </div>

      {/* Alerts */}
      {(alerts.expiringOrders > 0 || alerts.outOfStockProducts > 0) && (
        <div className="mb-8 border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Alertas</span>
          </div>
          <div className="space-y-1 text-sm text-gray-text">
            {alerts.expiringOrders > 0 && (
              <p>
                {alerts.expiringOrders} pedido(s) por vencer en las próximas 6
                horas
              </p>
            )}
            {alerts.outOfStockProducts > 0 && (
              <p>
                {alerts.outOfStockProducts} producto(s) sin stock disponible
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-heading text-base font-semibold">
            Últimos pedidos
          </h2>
          <Link
            href="/admin/pedidos"
            className="text-xs font-medium text-gray-text hover:text-black transition-colors"
          >
            Ver todos
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-text">
            No hay pedidos todavía
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-off-white/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium">{order.orderCode}</p>
                    <p className="text-xs text-gray-text">
                      {order.customer.name} &middot; {order.product.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {formatPriceFromDecimal(Number(order.amount))}
                  </span>
                  <StatusBadge
                    status={order.status as OrderStatusType}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
