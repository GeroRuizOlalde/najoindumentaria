import { PageHeader } from "@/components/shared/page-header";
import { BrandForm } from "@/components/admin/brand-form";
import { requireAdminPermission } from "@/lib/admin-permissions";

export default async function NewBrandPage() {
  await requireAdminPermission("brands.manage");

  return (
    <>
      <PageHeader
        title="Nueva marca"
        description="Crea una marca para tu catalogo"
      />
      <BrandForm />
    </>
  );
}
