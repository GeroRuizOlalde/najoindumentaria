import { getFeaturedProducts } from "@/lib/queries/products";
import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveBrands } from "@/lib/queries/brands";
import { getSettings } from "@/lib/queries/settings";
import { HeroSection } from "@/components/store/hero-section";
import { CategoriesGrid } from "@/components/store/categories-grid";
import { FeaturedProducts } from "@/components/store/featured-products";
import { BrandsCarousel } from "@/components/store/brands-carousel";
import { HowItWorks } from "@/components/store/how-it-works";
import { BenefitsSection } from "@/components/store/benefits-section";

export default async function HomePage() {
  const [featured, categories, brands, { map: settings }] = await Promise.all([
    getFeaturedProducts(8),
    getActiveCategories(),
    getActiveBrands(),
    getSettings(),
  ]);

  return (
    <>
      <HeroSection
        eyebrow={settings.content_home_hero_eyebrow || undefined}
        title={settings.content_home_hero_title || undefined}
        subtitle={settings.content_home_hero_subtitle || undefined}
        description={settings.content_home_hero_description || undefined}
        primaryCtaLabel={settings.content_home_primary_cta_label || undefined}
        primaryCtaHref={settings.content_home_primary_cta_href || undefined}
        secondaryCtaLabel={settings.content_home_secondary_cta_label || undefined}
        secondaryCtaHref={settings.content_home_secondary_cta_href || undefined}
      />
      <CategoriesGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <BrandsCarousel brands={brands} />
      <HowItWorks />
      <BenefitsSection />
    </>
  );
}
