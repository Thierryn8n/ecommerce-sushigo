import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { HeroSection } from '@/components/home/hero-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { ProductsSection } from '@/components/home/products-section'
import { CombosSection } from '@/components/home/combos-section'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <BenefitsSection />
      <CategoriesSection />
      <ProductsSection />
      <CombosSection />
      <Footer />
      <CartSidebar />
    </main>
  )
}
