import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  hasAdminPermission,
  type AdminPermission,
} from "@/lib/admin-permission-rules";

export { hasAdminPermission };
export type { AdminPermission };

const SUPER_SUPER_ADMIN_EMAILS = ["geroruizolalde13@gmail.com"];

export function isSuperSuperAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return SUPER_SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function requireAdminPermission(permission: AdminPermission) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (isSuperSuperAdminEmail(session.user.email)) {
    return session;
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

  if (isSuperSuperAdminEmail(session.user.email)) {
    return session;
  }

  if (!hasAdminPermission(session.user.role, permission)) {
    return null;
  }

  return session;
}

export async function requireSuperSuperAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!isSuperSuperAdminEmail(session.user.email)) {
    redirect("/admin/dashboard");
  }

  return session;
}
