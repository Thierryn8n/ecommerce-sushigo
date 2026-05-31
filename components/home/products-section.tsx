"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_featured: boolean
  category: {
    name: string
    slug: string
    color: string | null
  } | null
}

interface AppSettings {
  [key: string]: string
}

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<AppSettings>({})
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)
  const itemsPerView = isMobile ? 2 : 5

  useEffect(() => {
    // Detectar tamanho da tela
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    handleResize() // Executar na montagem
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Buscar todos os produtos ativos
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug, color)
        `)
        .eq('is_active', true)
        .order('display_order')

      if (productsData) {
        setProducts(productsData)
      }

      // Buscar configurações da home
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('section', 'home')

      if (settingsData) {
        const settingsObj: AppSettings = {}
        settingsData.forEach((item) => {
          settingsObj[item.key] = item.value || ''
        })
        setSettings(settingsObj)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  // Auto scroll
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    autoScrollRef.current = setInterval(() => {
      if (!isPaused && products.length > itemsPerView) {
        setCurrentIndex((prev) => {
          const nextIndex = prev + 1
          return nextIndex >= products.length ? 0 : nextIndex
        })
      }
    }, 3000)
  }, [isPaused, products.length, itemsPerView])

  useEffect(() => {
    startAutoScroll()
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    }
  }, [startAutoScroll])

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth / products.length
      scrollRef.current.scrollTo({
        left: scrollWidth * index,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToIndex(currentIndex)
  }, [currentIndex])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= products.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return (
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="animate-pulse">
              <div className="h-4 bg-muted-foreground/20 rounded w-24 mb-1"></div>
              <div className="h-8 bg-muted-foreground/20 rounded w-48"></div>
            </div>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] animate-pulse bg-card rounded-2xl overflow-hidden">
                <div className="aspect-square bg-muted-foreground/10"></div>
                <div className="p-4">
                  <div className="h-6 bg-muted-foreground/10 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted-foreground/10 rounded w-full mb-3"></div>
                  <div className="h-8 bg-muted-foreground/10 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 sm:py-16 bg-muted">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <p className="text-secondary text-xs sm:text-sm font-semibold tracking-wider mb-1">
              {settings.products_subtitle || 'OS MAIS PEDIDOS'}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              {settings.products_title || 'Sucessos da Praia'}
            </h2>
          </div>
          <Link href="/cardapio" className="hidden sm:block">
            <Button 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
            >
              VER TODOS
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Carousel Navigation - Desktop */}
        {products.length > itemsPerView && (
          <div className="hidden sm:flex items-center justify-center gap-2 mt-6 mb-4">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Products Carousel */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            ref={scrollRef}
            className="flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[calc(50%-12px)] sm:w-[calc(20%-24px)] snap-start"
              >
                <Link href={`/produto/${product.slug}`}>
                  <div className="group bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border hover:border-primary transition-all hover:scale-[1.02]">
                    {/* Product Image */}
                    <div className="relative aspect-square p-2 sm:p-4 bg-gradient-to-br from-muted to-muted/50">
                      <Image
                        src={product.image_url || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png'}
                        alt={product.name}
                        fill
                        className="object-contain p-2 sm:p-4 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4">
                      <h3 className="text-foreground font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 truncate">{product.name}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold text-sm">Monte do seu jeito</span>
                        <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors">
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Ver Todos Button */}
        <div className="sm:hidden mt-4 text-center">
          <Link href="/cardapio">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10 rounded-full text-sm px-6"
            >
              VER TODOS
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
