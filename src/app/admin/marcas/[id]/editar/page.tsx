import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { BrandForm } from "@/components/admin/brand-form";
import { getBrandById } from "@/lib/queries/brands";
import { requireAdminPermission } from "@/lib/admin-permissions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: Props) {
  await requireAdminPermission("brands.manage");

  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) notFound();

  return (
    <>
      <PageHeader
        title={`Editar marca: ${brand.name}`}
        description="Actualiza datos de la marca"
      />
      <BrandForm
        brand={{
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo,
          banner: brand.banner,
          description: brand.description,
          sortOrder: brand.sortOrder,
          active: brand.active,
        }}
      />
    </>
  );
}
