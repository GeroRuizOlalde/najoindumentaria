import { getFeaturedProducts } from "@/lib/queries/products";
import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveBrands } from "@/lib/queries/brands";
import { HeroSection } from "@/components/store/hero-section";
import { CategoriesGrid } from "@/components/store/categories-grid";
import { FeaturedProducts } from "@/components/store/featured-products";
import { BrandsCarousel } from "@/components/store/brands-carousel";
import { HowItWorks } from "@/components/store/how-it-works";
import { BenefitsSection } from "@/components/store/benefits-section";

export default async function HomePage() {
  const [featured, categories, brands] = await Promise.all([
    getFeaturedProducts(8),
    getActiveCategories(),
    getActiveBrands(),
  ]);

  return (
    <>
      <HeroSection />
      <CategoriesGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <BrandsCarousel brands={brands} />
      <HowItWorks />
      <BenefitsSection />
    </>
  );
}
