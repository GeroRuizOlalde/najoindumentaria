import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { getCategoryById } from "@/lib/queries/categories";
import { requireAdminPermission } from "@/lib/admin-permissions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  await requireAdminPermission("categories.manage");

  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) notFound();

  return (
    <>
      <PageHeader
        title={`Editar categoria: ${category.name}`}
        description="Actualiza datos de la categoria"
      />
      <CategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          image: category.image,
          description: category.description,
          sortOrder: category.sortOrder,
          active: category.active,
        }}
      />
    </>
  );
}
