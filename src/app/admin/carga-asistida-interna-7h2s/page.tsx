import { ExcelProductAssistant } from "@/components/admin/excel-product-assistant";
import { PageHeader } from "@/components/shared/page-header";
import { requireSuperSuperAdmin } from "@/lib/admin-permissions";
import { getActiveBrands } from "@/lib/queries/brands";
import { getActiveCategories } from "@/lib/queries/categories";

export default async function HiddenExcelAssistantPage() {
  await requireSuperSuperAdmin();

  const [brands, categories] = await Promise.all([
    getActiveBrands(),
    getActiveCategories(),
  ]);

  return (
    <>
      <PageHeader
        title="Carga asistida interna"
        description="Herramienta privada para preparar fichas desde Excel sin exponer nada al cliente."
      />
      <ExcelProductAssistant brands={brands} categories={categories} />
    </>
  );
}
