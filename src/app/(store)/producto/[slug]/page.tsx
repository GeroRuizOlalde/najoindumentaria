import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductActions } from "@/components/store/product-actions";
import { ProductCard } from "@/components/store/product-card";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ReviewForm } from "@/components/store/review-form";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { customerHasDeliveredProduct } from "@/lib/customer-orders";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} - ${product.brand.name}`,
    description:
      product.metaDescription ||
      `Compra ${product.name} de ${product.brand.name} en Najo Indumentaria.`,
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "ACTIVE" || product.sizes.length === 0) {
    notFound();
  }

  const customerSession = await getCustomerSession();

  const [related, wishlistItem, ownReview, canReview] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, 4),
    customerSession
      ? prisma.wishlistItem.findUnique({
          where: {
            customerId_productId: {
              customerId: customerSession.customerId,
              productId: product.id,
            },
          },
        })
      : null,
    customerSession
      ? prisma.review.findUnique({
          where: {
            productId_customerId: {
              productId: product.id,
              customerId: customerSession.customerId,
            },
          },
        })
      : null,
    customerSession
      ? customerHasDeliveredProduct(customerSession.customerId, product.id)
      : false,
  ]);

  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.metaDescription || product.description,
    brand: { "@type": "Brand", name: product.brand.name },
    aggregateRating:
      reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "ARS",
      availability: product.sizes.some((size) => size.stock > 0 && size.isAvailable)
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
        <nav className="mb-8 text-xs text-gray-text">
          <Link href="/shop" className="transition-colors hover:text-black">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/shop/categoria/${product.category.slug}`}
            className="transition-colors hover:text-black"
          >
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="space-y-6">
            <div>
              <Link
                href={`/shop/marca/${product.brand.slug}`}
                className="text-xs uppercase tracking-wider text-gray-text transition-colors hover:text-black"
              >
                {product.brand.name}
              </Link>
              <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-gray-text">
                {reviewCount > 0
                  ? `${averageRating.toFixed(1)} / 5 · ${reviewCount} reseñas`
                  : "Aun no tiene reseñas aprobadas"}
              </p>
            </div>

            <ProductActions
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              productImage={product.images[0] || ""}
              brandName={product.brand.name}
              price={Number(product.price)}
              compareAtPrice={
                product.compareAtPrice ? Number(product.compareAtPrice) : null
              }
              sizes={product.sizes.map((size) => ({
                id: size.id,
                sizeLabel: size.sizeLabel,
                stock: size.stock,
                isAvailable: size.isAvailable,
              }))}
              isWishlisted={!!wishlistItem}
              isLoggedIn={!!customerSession}
            />

            <div className="border-t border-border pt-6">
              <Accordion>
                {product.description && (
                  <AccordionItem title="Descripcion">
                    <div className="whitespace-pre-line text-sm leading-relaxed text-gray-text">
                      {product.description}
                    </div>
                  </AccordionItem>
                )}
                <AccordionItem title="Envios">
                  <p className="text-sm leading-relaxed text-gray-text">
                    Hacemos envios a todo el pais. El costo de envio se calcula
                    segun tu ubicacion. Tambien podes retirar en nuestro punto de
                    entrega.
                  </p>
                </AccordionItem>
                <AccordionItem title="Formas de pago">
                  <p className="text-sm leading-relaxed text-gray-text">
                    Aceptamos transferencia bancaria. Al reservar, te enviamos los
                    datos para que realices la transferencia dentro de las 48hs.
                  </p>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        <section className="mt-20 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight">
              Reseñas de clientes
            </h2>

            {product.reviews.length === 0 ? (
              <div className="border border-border bg-white p-6 text-sm text-gray-text">
                Todavia no hay reseñas aprobadas para este producto.
              </div>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <article key={review.id} className="border border-border bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{review.customer.name}</p>
                        <p className="text-xs text-gray-text">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-text">
                        {new Date(review.createdAt).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    {review.title && <h3 className="mt-3 text-sm font-medium">{review.title}</h3>}
                    <p className="mt-2 text-sm leading-relaxed text-gray-text">
                      {review.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="border border-border bg-white p-6">
            <h2 className="font-heading text-xl font-semibold">Deja tu reseña</h2>
            <p className="mt-2 text-sm text-gray-text">
              Comparte tu experiencia con otros clientes.
            </p>
            <div className="mt-5">
              {customerSession && canReview ? (
                <ReviewForm
                  productId={product.id}
                  productSlug={product.slug}
                  existingReview={
                    ownReview
                      ? {
                          rating: ownReview.rating,
                          title: ownReview.title,
                          content: ownReview.content,
                          status: ownReview.status,
                        }
                      : null
                  }
                />
              ) : customerSession ? (
                <p className="text-sm text-gray-text">
                  Podras dejar una resena cuando este producto figure como
                  entregado en uno de tus pedidos.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-text">
                    Inicia sesion para guardar favoritos y dejar una reseña.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center bg-black px-5 text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                  >
                    Iniciar sesion
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 font-heading text-2xl font-bold tracking-tight">
              Tambien te puede gustar
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.slug} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
