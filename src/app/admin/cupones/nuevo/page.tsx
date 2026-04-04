import { PageHeader } from "@/components/shared/page-header";
import { CouponForm } from "@/components/admin/coupon-form";
import { requireAdminPermission } from "@/lib/admin-permissions";

export default async function NewCouponPage() {
  await requireAdminPermission("coupons.manage");

  return (
    <>
      <PageHeader
        title="Nuevo cupon"
        description="Crea descuentos para reservas simples o carrito."
      />
      <CouponForm />
    </>
  );
}
