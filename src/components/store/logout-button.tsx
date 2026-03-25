"use client";

import { logoutCustomer } from "@/lib/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logoutCustomer}>
      <Button type="submit" variant="ghost" size="sm">
        <LogOut className="h-3.5 w-3.5 mr-1.5" />
        Cerrar sesión
      </Button>
    </form>
  );
}
