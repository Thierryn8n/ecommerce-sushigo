import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { HeroSection } from '@/components/home/hero-section'
import { HeroTransition } from '@/components/home/hero-transition'
import { BannersSection } from '@/components/home/banners-section'
import { SectionDivider } from '@/components/home/section-divider'
import { BenefitsSection } from '@/components/home/benefits-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { ProductsSection } from '@/components/home/products-section'
import { CombosSection } from '@/components/home/combos-section'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <HeroTransition />
      <BannersSection />
      <SectionDivider />
      <BenefitsSection />
      <CategoriesSection />
      <ProductsSection />
      <CombosSection />
      <Footer />
      <CartSidebar />
    </main>
  )
}
