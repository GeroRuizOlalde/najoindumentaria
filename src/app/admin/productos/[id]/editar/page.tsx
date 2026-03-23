import { notFound } from "next/navigation";
import { getProductById } from "@/lib/queries/products";
import { getActiveBrands } from "@/lib/queries/brands";
import { getActiveCategories } from "@/lib/queries/categories";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/admin/product-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    getProductById(id),
    getActiveBrands(),
    getActiveCategories(),
  ]);

  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={`Editar: ${product.name}`}
        description="Modificá los datos del producto"
      />
      <ProductForm
        brands={brands}
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          brandId: product.brandId,
          categoryId: product.categoryId,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
          description: product.description,
          shortDescription: product.shortDescription,
          images: product.images,
          status: product.status,
          featured: product.featured,
          sortOrder: product.sortOrder,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          sizes: product.sizes.map((s) => ({
            sizeLabel: s.sizeLabel,
            isAvailable: s.isAvailable,
          })),
        }}
      />
    </>
  );
}
