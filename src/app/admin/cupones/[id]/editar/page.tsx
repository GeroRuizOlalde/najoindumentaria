import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CouponForm } from "@/components/admin/coupon-form";
import { requireAdminPermission } from "@/lib/admin-permissions";
import { getCouponById } from "@/lib/queries/coupons";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  await requireAdminPermission("coupons.manage");

  const { id } = await params;
  const coupon = await getCouponById(id);

  if (!coupon) notFound();

  return (
    <>
      <PageHeader
        title={`Editar ${coupon.code}`}
        description="Actualiza vigencia, reglas y estado del cupon."
      />
      <CouponForm coupon={coupon} />
    </>
  );
}
