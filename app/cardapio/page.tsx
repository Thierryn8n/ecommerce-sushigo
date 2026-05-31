"use client"

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Search, Plus, ChevronDown, ChevronLeft, ChevronRight,
  LayoutGrid, Truck, Fish, Award, ShieldCheck
} from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
  icon_url?: string | null
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  base_price: number
  promotion_price: number | null
  image_url: string | null
  is_featured: boolean
  category_id: string | null
  category: Category | null
  pieces_count?: number | null
}

const CATEGORY_ICONS: Record<string, string> = {
  combos: '🍱',
  sashimis: '🐟',
  niguiris: '🍣',
  'hot-empanados': '🔥',
  uramakis: '🌯',
  hossomakis: '🌀',
  'joes-especiais': '⭐',
  porcoes: '🍽',
  bebidas: '🥤',
  sobremesas: '🍮',
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Mais populares' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'name', label: 'Nome (A-Z)' },
]

const ITEMS_PER_PAGE = 12

function CardapioContent() {
  const searchParams = useSearchParams()
  const categoriaParam = searchParams.get('categoria')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoriaParam)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('popular')
  const [currentPage, setCurrentPage] = useState(1)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (categoriesData) setCategories(categoriesData)

      const { data: productsData } = await supabase
        .from('products')
        .select(`*, category:categories(id, name, slug, color)`)
        .eq('is_active', true)
        .order('display_order')

      if (productsData) setProducts(productsData)

      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (categoriaParam) setSelectedCategory(categoriaParam)
  }, [categoriaParam])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchTerm, sortBy, selectedTypes, priceRange])

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || p.category?.slug === selectedCategory
      const price = p.promotion_price || p.base_price
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]
      return matchesSearch && matchesCategory && matchesPrice
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.promotion_price || a.base_price) - (b.promotion_price || b.base_price)
      if (sortBy === 'price_desc') return (b.promotion_price || b.base_price) - (a.promotion_price || a.base_price)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const formatPrice = (price: number) =>
    `R$ ${Number(price).toFixed(2).replace('.', ',')}`

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Mais populares'

  const clearFilters = () => {
    setPriceRange([0, 200])
    setSelectedTypes([])
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <section className="pt-28 pb-10 bg-background border-b border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">NOSSO CARDAPIO</h1>
            <p className="text-muted-foreground text-sm">
              Sushis preparados com ingredientes selecionados e o melhor sabor da culinaria japonesa.
            </p>
          </div>
          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border text-foreground placeholder:text-muted-foreground rounded-lg pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-5 w-56 flex-shrink-0">
            {/* Categories */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground font-bold text-sm tracking-wider mb-4">CATEGORIAS</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center gap-3 py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                      !selectedCategory
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                    <span>Todos os produtos</span>
                    {!selectedCategory && (
                      <span className="ml-auto w-1 h-4 rounded-full bg-primary" />
                    )}
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full flex items-center gap-3 py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat.slug
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-base leading-none flex-shrink-0">
                        {CATEGORY_ICONS[cat.slug] || '🍣'}
                      </span>
                      <span>{cat.name}</span>
                      {selectedCategory === cat.slug && (
                        <span className="ml-auto w-1 h-4 rounded-full bg-primary" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground font-bold text-sm tracking-wider mb-4">FILTRAR POR</h3>

              {/* Tipo */}
              <div className="mb-5">
                <p className="text-foreground text-xs font-semibold mb-3">Tipo</p>
                <div className="space-y-2">
                  {['Todos', 'Cru', 'Cozido', 'Empanado', 'Grelhado'].map((tipo) => (
                    <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tipo === 'Todos' ? selectedTypes.length === 0 : selectedTypes.includes(tipo)}
                        onChange={() => {
                          if (tipo === 'Todos') {
                            setSelectedTypes([])
                          } else {
                            setSelectedTypes(prev =>
                              prev.includes(tipo)
                                ? prev.filter(t => t !== tipo)
                                : [...prev, tipo]
                            )
                          }
                        }}
                        className="w-4 h-4 rounded border-border accent-primary"
                      />
                      <span className="text-muted-foreground text-sm">{tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Faixa de preco */}
              <div className="mb-5">
                <p className="text-foreground text-xs font-semibold mb-3">Faixa de preco</p>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>R$ 0</span>
                  <span>R$ {priceRange[1]}+</span>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full border border-border text-foreground text-xs font-bold py-2.5 rounded-lg hover:border-primary hover:text-primary transition-colors tracking-wider"
              >
                LIMPAR FILTROS
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground font-semibold text-base">
                {selectedCategory
                  ? categories.find(c => c.slug === selectedCategory)?.name || 'Produtos'
                  : 'Todos os produtos'}
              </h2>
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 bg-card border border-border text-sm text-foreground rounded-lg px-4 py-2 hover:border-primary transition-colors"
                >
                  <span>Ordenar por:</span>
                  <span className="font-semibold">{currentSortLabel}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-20 py-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSortDropdown(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                          sortBy === opt.value ? 'text-primary font-semibold' : 'text-foreground'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-card rounded-xl overflow-hidden border border-border">
                    <div className="aspect-square bg-muted" />
                    <div className="p-3">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                      <div className="h-5 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground text-lg mb-2">Nenhum produto encontrado</p>
                <p className="text-muted-foreground/60 text-sm">Tente ajustar os filtros ou buscar outro termo</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedProducts.map((product) => {
                  const price = product.promotion_price || product.base_price
                  return (
                    <Link key={product.id} href={`/produto/${product.slug}`}>
                      <div className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all">
                        {/* Image */}
                        <div className="relative aspect-square bg-[#111]">
                          {product.is_featured && (
                            <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm">
                              MAIS VENDIDO
                            </div>
                          )}
                          <Image
                            src={product.image_url || '/images/sashimi-salmao.png'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>

                        {/* Info */}
                        <div className="p-3">
                          <p className="text-foreground font-semibold text-sm leading-tight mb-0.5">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-muted-foreground text-xs mb-2 line-clamp-1">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              {product.promotion_price && (
                                <p className="text-muted-foreground text-xs line-through">
                                  {formatPrice(product.base_price)}
                                </p>
                              )}
                              <p className="text-primary font-bold text-sm">
                                {formatPrice(price)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.preventDefault() }}
                              className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page = i + 1
                  if (totalPages > 5) {
                    if (currentPage <= 3) page = i + 1
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i
                    else page = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg border text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-foreground hover:border-primary hover:text-primary'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-muted-foreground px-1">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 rounded-lg border border-border text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Strip */}
      <div className="border-t border-border bg-card mt-8">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Fish, title: 'PEIXES SELECIONADOS', sub: 'Todos os dias' },
              { icon: Truck, title: 'ENTREGA RAPIDA', sub: 'Ate 60 minutos' },
              { icon: Award, title: 'EMBALAGEM PREMIUM', sub: 'Mais qualidade para voce' },
              { icon: ShieldCheck, title: 'PAGAMENTO SEGURO', sub: 'Seus dados protegidos' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-4">
                <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <p className="text-foreground font-bold text-xs tracking-wide">{title}</p>
                  <p className="text-muted-foreground text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
        <div className="pt-28 flex items-center justify-center min-h-[50vh]">
          <div className="text-muted-foreground">Carregando cardapio...</div>
        </div>
      </main>
    }>
      <CardapioContent />
    </Suspense>
  )
}
