"use client"

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  category_id: string | null
  category: Category | null
}

function CardapioContent() {
  const searchParams = useSearchParams()
  const categoriaParam = searchParams.get('categoria')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoriaParam)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Buscar categorias
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Buscar produtos
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .eq('is_active', true)
        .order('display_order')

      if (productsData) {
        setProducts(productsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (categoriaParam) {
      setSelectedCategory(categoriaParam)
    }
  }, [categoriaParam])

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesCategory = !selectedCategory || product.category?.slug === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-primary/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Nosso <span className="text-secondary">Cardapio</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Escolha seu acai favorito e monte do seu jeito com os melhores ingredientes!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-card sticky top-20 z-40 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                className={`whitespace-nowrap rounded-full ${
                  selectedCategory === null 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                Todos
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`whitespace-nowrap rounded-full ${
                    selectedCategory === cat.slug
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-2xl overflow-hidden">
                  <div className="aspect-square bg-muted/50"></div>
                  <div className="p-4">
                    <div className="h-6 bg-muted/50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted/50 rounded w-full mb-3"></div>
                    <div className="h-8 bg-muted/50 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !filteredProducts || filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <Link href={`/produto/${product.slug}`}>
                    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all hover:scale-[1.02]">
                      {/* Product Image */}
                      <div className="relative aspect-square p-4 bg-gradient-to-br from-muted to-muted/50">
                        <Image
                          src={product.image_url || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png'}
                          alt={product.name}
                          fill
                          className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.category && (
                          <div 
                            className="absolute top-3 right-3 text-primary-foreground text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: product.category.color ? `${product.category.color}80` : 'var(--primary)80' }}
                          >
                            {product.category.name}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-foreground font-bold text-lg mb-1">{product.name}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-bold text-sm">Monte do seu jeito</span>
                          <button className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors">
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <CartSidebar />
    </main>
  )
}

export default function CardapioPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Nosso Cardápio
              </h1>
              <p className="text-white/70">Carregando...</p>
            </div>
          </div>
        </section>
      </main>
    }>
      <CardapioContent />
    </Suspense>
  )
}
