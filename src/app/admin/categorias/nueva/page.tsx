import { PageHeader } from "@/components/shared/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdminPermission } from "@/lib/admin-permissions";

export default async function NewCategoryPage() {
  await requireAdminPermission("categories.manage");

  return (
    <>
      <PageHeader
        title="Nueva categoria"
        description="Crea una categoria para tu catalogo"
      />
      <CategoryForm />
    </>
  );
}
