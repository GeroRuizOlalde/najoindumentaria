import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  hasAdminPermission,
  type AdminPermission,
} from "@/lib/admin-permission-rules";

export { hasAdminPermission };
export type { AdminPermission };

export async function requireAdminPermission(permission: AdminPermission) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!hasAdminPermission(session.user.role, permission)) {
    redirect("/admin/dashboard");
  }

  return session;
}

export async function getAdminActionSession(permission: AdminPermission) {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (!hasAdminPermission(session.user.role, permission)) {
    return null;
  }

  return session;
}
