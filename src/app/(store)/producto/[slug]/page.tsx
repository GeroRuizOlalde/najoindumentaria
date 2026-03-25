import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductActions } from "@/components/store/product-actions";
import { ProductCard } from "@/components/store/product-card";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} — ${product.brand.name}`,
    description:
      product.metaDescription ||
      `Comprá ${product.name} de ${product.brand.name} en Najo Indumentaria.`,
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "ACTIVE") notFound();

  const related = await getRelatedProducts(
    product.id,
    product.categoryId,
    4
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.metaDescription || product.description,
    brand: { "@type": "Brand", name: product.brand.name },
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "ARS",
      availability: product.sizes.some((s) => s.stock > 0 && s.isAvailable)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-xs text-gray-text">
          <Link href="/shop" className="hover:text-black transition-colors">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/shop/categoria/${product.category.slug}`}
            className="hover:text-black transition-colors"
          >
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        {/* Product layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <ProductGallery
            images={product.images}
            productName={product.name}
          />

          {/* Info */}
          <div className="space-y-6">
            <div>
              <Link
                href={`/shop/marca/${product.brand.slug}`}
                className="text-xs uppercase tracking-wider text-gray-text hover:text-black transition-colors"
              >
                {product.brand.name}
              </Link>
              <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
            </div>

            <ProductActions
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              productImage={product.images[0] || ""}
              brandName={product.brand.name}
              price={Number(product.price)}
              compareAtPrice={
                product.compareAtPrice
                  ? Number(product.compareAtPrice)
                  : null
              }
              sizes={product.sizes.map((s) => ({
                id: s.id,
                sizeLabel: s.sizeLabel,
                stock: s.stock,
                isAvailable: s.isAvailable,
              }))}
            />

            {/* Accordion details */}
            <div className="border-t border-border pt-6">
              <Accordion>
                {product.description && (
                  <AccordionItem title="Descripción">
                    <div className="text-sm text-gray-text leading-relaxed whitespace-pre-line">
                      {product.description}
                    </div>
                  </AccordionItem>
                )}
                <AccordionItem title="Envíos">
                  <p className="text-sm text-gray-text leading-relaxed">
                    Hacemos envíos a todo el país. El costo de envío se calcula
                    según tu ubicación. También podés retirar en nuestro punto
                    de entrega.
                  </p>
                </AccordionItem>
                <AccordionItem title="Formas de pago">
                  <p className="text-sm text-gray-text leading-relaxed">
                    Aceptamos transferencia bancaria. Al reservar, te enviamos
                    los datos para que realices la transferencia dentro de las
                    48hs.
                  </p>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-heading text-2xl font-bold tracking-tight mb-8">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
