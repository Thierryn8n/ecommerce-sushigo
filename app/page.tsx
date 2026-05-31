import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { HeroSection } from '@/components/home/hero-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { CombosSection } from '@/components/home/combos-section'
import { ProductsSection } from '@/components/home/products-section'
import { PromoBanner } from '@/components/home/promo-banner'
import { PromosSection } from '@/components/home/promos-section'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <CombosSection />
      <ProductsSection />
      <PromosSection />
      <Footer />
      <CartSidebar />
    </main>
  )
}
