"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import {
  LayoutDashboard,
  Package,
  Tags,
  FolderOpen,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/marcas", label: "Marcas", icon: Tags },
  { href: "/admin/categorias", label: "Categorías", icon: FolderOpen },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

interface SidebarProps {
  userName: string;
  userRole: string;
}

export function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-6">
        <Logo variant="light" href="/admin/dashboard" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 px-6 py-4">
        <div className="text-sm text-white/80">{userName}</div>
        <div className="text-xs text-white/40">{userRole}</div>
        <form action="/api/auth/signout" method="POST" className="mt-3">
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-black text-white p-2 rounded"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-black">
        {navContent}
      </aside>

      {/* Sidebar - mobile */}
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
