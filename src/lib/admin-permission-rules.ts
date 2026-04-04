import type { UserRole } from "@/generated/prisma/client";

export type AdminPermission =
  | "dashboard.view"
  | "products.view"
  | "products.manage"
  | "brands.view"
  | "brands.manage"
  | "categories.view"
  | "categories.manage"
  | "orders.view"
  | "orders.manage"
  | "customers.view"
  | "customers.manage"
  | "settings.view"
  | "settings.manage"
  | "content.view"
  | "content.manage"
  | "coupons.view"
  | "coupons.manage"
  | "reviews.view"
  | "reviews.manage";

const PERMISSIONS_BY_ROLE: Record<UserRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "dashboard.view",
    "products.view",
    "products.manage",
    "brands.view",
    "brands.manage",
    "categories.view",
    "categories.manage",
    "orders.view",
    "orders.manage",
    "customers.view",
    "customers.manage",
    "settings.view",
    "settings.manage",
    "content.view",
    "content.manage",
    "coupons.view",
    "coupons.manage",
    "reviews.view",
    "reviews.manage",
  ],
  ADMIN: [
    "dashboard.view",
    "products.view",
    "products.manage",
    "brands.view",
    "brands.manage",
    "categories.view",
    "categories.manage",
    "orders.view",
    "orders.manage",
    "customers.view",
    "customers.manage",
    "settings.view",
    "settings.manage",
    "content.view",
    "content.manage",
    "coupons.view",
    "coupons.manage",
    "reviews.view",
    "reviews.manage",
  ],
  EDITOR: [
    "dashboard.view",
    "products.view",
    "products.manage",
    "brands.view",
    "brands.manage",
    "categories.view",
    "categories.manage",
    "content.view",
    "content.manage",
    "reviews.view",
    "reviews.manage",
  ],
  OPERATOR: [
    "dashboard.view",
    "products.view",
    "orders.view",
    "orders.manage",
    "customers.view",
    "coupons.view",
    "coupons.manage",
    "reviews.view",
    "reviews.manage",
  ],
  VIEWER: [
    "dashboard.view",
    "products.view",
    "brands.view",
    "categories.view",
    "orders.view",
    "customers.view",
    "settings.view",
    "content.view",
    "coupons.view",
    "reviews.view",
  ],
};

export function hasAdminPermission(
  role: UserRole | undefined,
  permission: AdminPermission
) {
  if (!role) return false;
  return PERMISSIONS_BY_ROLE[role]?.includes(permission) ?? false;
}
