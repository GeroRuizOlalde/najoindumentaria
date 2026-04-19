import { getActiveBrands } from "@/lib/queries/brands";
import { getActiveCategories } from "@/lib/queries/categories";
import { PageHeader } from "@/components/shared/page-header";
import { ProductDraftLoader } from "@/components/admin/product-draft-loader";
import { requireAdminPermission } from "@/lib/admin-permissions";

export default async function NewProductPage() {
  await requireAdminPermission("products.manage");
  const [brands, categories] = await Promise.all([
    getActiveBrands(),
    getActiveCategories(),
  ]);

  return (
    <>
      <PageHeader
        title="Nuevo producto"
        description="Cargá un nuevo producto al catálogo"
      />
      <ProductDraftLoader brands={brands} categories={categories} />
    </>
  );
}
