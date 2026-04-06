"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import {
  hasAdminPermission,
  type AdminPermission,
} from "@/lib/admin-permission-rules";
import {
  LayoutDashboard,
  Package,
  Tags,
  FolderOpen,
  ShoppingBag,
  Users,
  Settings,
  TicketPercent,
  MessageSquareQuote,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNotifications } from "./notification-context";
import { logoutAdminAction } from "@/lib/actions/auth";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view" as AdminPermission,
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: ShoppingBag,
    permission: "orders.view" as AdminPermission,
  },
  {
    href: "/admin/productos",
    label: "Productos",
    icon: Package,
    permission: "products.view" as AdminPermission,
  },
  {
    href: "/admin/marcas",
    label: "Marcas",
    icon: Tags,
    permission: "brands.view" as AdminPermission,
  },
  {
    href: "/admin/categorias",
    label: "Categorias",
    icon: FolderOpen,
    permission: "categories.view" as AdminPermission,
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    icon: Users,
    permission: "customers.view" as AdminPermission,
  },
  {
    href: "/admin/cupones",
    label: "Cupones",
    icon: TicketPercent,
    permission: "coupons.view" as AdminPermission,
  },
  {
    href: "/admin/resenas",
    label: "Resenas",
    icon: MessageSquareQuote,
    permission: "reviews.view" as AdminPermission,
  },
  {
    href: "/admin/contenido",
    label: "Contenido",
    icon: FileText,
    permission: "content.view" as AdminPermission,
  },
  {
    href: "/admin/configuracion",
    label: "Configuracion",
    icon: Settings,
    permission: "settings.view" as AdminPermission,
  },
];

interface SidebarProps {
  userName: string;
  userRole: string;
}

export function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { newOrders, pendingReviews } = useNotifications();

  const visibleNavItems = navItems.filter((item) =>
    hasAdminPermission(userRole as never, item.permission)
  );

  const navContent = (
    <>
      <div className="px-6 py-6">
        <Logo variant="light" href="/admin/dashboard" />
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/pedidos" && newOrders > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                  {newOrders > 99 ? "99+" : newOrders}
                </span>
              )}
              {item.href === "/admin/resenas" && pendingReviews > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                  {pendingReviews > 99 ? "99+" : pendingReviews}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-4">
        <div className="text-sm text-white/80">{userName}</div>
        <div className="text-xs text-white/40">{userRole}</div>
        <form action={logoutAdminAction} className="mt-3">
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesion
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-black text-white p-2 rounded"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-black">
        {navContent}
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-black transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>
    </>
  );
}
