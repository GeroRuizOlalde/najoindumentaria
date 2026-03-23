import { getActiveBrands } from "@/lib/queries/brands";
import { getActiveCategories } from "@/lib/queries/categories";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
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
      <ProductForm brands={brands} categories={categories} />
    </>
  );
}
