"use client"

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart, ChevronLeft, ChevronRight, Minus, Plus,
  Truck, Star, ShoppingCart, Truck as TruckIcon, Fish, Award, ShieldCheck
} from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { useCart } from '@/contexts/cart-context'
import { createClient } from '@/lib/supabase/client'

interface ProductSize {
  id: string
  label: string
  pieces: number
  price: number
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
  category: { name: string; slug: string; color: string | null } | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profile: { full_name: string | null } | null
}

const MOCK_INGREDIENTS = [
  { name: 'Salmao Fresco', emoji: '🐟' },
  { name: 'Cream Cheese', emoji: '🧀' },
  { name: 'Pepino', emoji: '🥒' },
  { name: 'Arroz Japones', emoji: '🍚' },
  { name: 'Alga Nori', emoji: '🌿' },
  { name: 'Cebolinha', emoji: '🌱' },
  { name: 'Gergelim', emoji: '⚪' },
]

const MOCK_ALLERGENS = [
  { name: 'Peixe', emoji: '🐠' },
  { name: 'Leite', emoji: '🥛' },
  { name: 'Gergelim', emoji: '⚪' },
]

const MOCK_REVIEWS: Review[] = [
  { id: '1', rating: 5, comment: 'Simplesmente maravilhoso! Meu preferido da casa.', created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), profile: { full_name: 'Mariana S.' } },
  { id: '2', rating: 5, comment: 'Pecas sempre frescas e bem feitas. Recomendo!', created_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), profile: { full_name: 'Carlos A.' } },
  { id: '3', rating: 5, comment: 'Chegou rapido e tudo impecavel como sempre.', created_at: new Date(Date.now() - 14 * 24 * 3600000).toISOString(), profile: { full_name: 'Juliana P.' } },
]

function formatPrice(price: number) {
  return `R$ ${Number(price).toFixed(2).replace('.', ',')}`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ha 1 dia'
  if (days < 7) return `Ha ${days} dias`
  if (days < 14) return 'Ha 1 semana'
  const weeks = Math.floor(days / 7)
  return `Ha ${weeks} semanas`
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [added, setAdded] = useState(false)

  // Mock product images (gallery)
  const productImages = product?.image_url
    ? [product.image_url, product.image_url, product.image_url, product.image_url]
    : []

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

      const { data } = await supabase
        .from('products')
        .select(`*, category:categories(name, slug, color)`)
        .eq(isUuid ? 'id' : 'slug', id)
        .eq('is_active', true)
        .single()

      if (data) {
        setProduct(data)

        // Fetch related products
        const { data: related } = await supabase
          .from('products')
          .select(`*, category:categories(name, slug, color)`)
          .eq('is_active', true)
          .neq('id', data.id)
          .limit(5)
          .order('display_order')

        if (related) setRelatedProducts(related)
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 container mx-auto px-4 py-8">
          <div className="animate-pulse grid lg:grid-cols-2 gap-10">
            <div className="bg-card rounded-2xl aspect-[4/3]" />
            <div className="space-y-4">
              <div className="h-4 bg-card rounded w-1/4" />
              <div className="h-8 bg-card rounded w-3/4" />
              <div className="h-4 bg-card rounded w-full" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-xl font-bold mb-4">Produto nao encontrado</p>
          <Link href="/cardapio" className="text-primary hover:underline">Voltar ao cardapio</Link>
        </div>
      </main>
    )
  }

  // Build size options based on base price
  const sizeOptions: ProductSize[] = [
    { id: 's', label: `8 pecas`, pieces: 8, price: product.base_price },
    { id: 'm', label: `16 pecas`, pieces: 16, price: product.base_price * 1.85 },
    { id: 'l', label: `32 pecas`, pieces: 32, price: product.base_price * 3.45 },
  ]

  const activePrice = sizeOptions[selectedSize].price * quantity

  const handleAddToCart = () => {
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: `${product.name} (${sizeOptions[selectedSize].label})`,
      image: product.image_url || '',
      basePrice: product.base_price,
      totalPrice: sizeOptions[selectedSize].price,
      quantity,
      toppings: [],
      sauces: [],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="pt-20 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            {product.category && (
              <>
                <Link href={`/cardapio?categoria=${product.category.slug}`} className="hover:text-primary transition-colors capitalize">
                  {product.category.name}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Hero */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-14">
          {/* Gallery */}
          <div>
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden bg-[#111] aspect-[4/3] mb-3">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-primary text-primary' : 'text-foreground'}`}
                />
              </button>

              {productImages.length > 0 ? (
                <Image
                  src={productImages[activeImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Sem imagem
                </div>
              )}

              {/* Prev/Next arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + productImages.length) % productImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % productImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category badge */}
            {product.category && (
              <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">
                {product.category.name}
              </p>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4].map(s => (
                  <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                ))}
                <Star className="w-4 h-4 fill-primary/50 text-primary" />
              </div>
              <span className="text-foreground text-sm font-semibold">4.8</span>
              <span className="text-muted-foreground text-sm">(126 avaliacoes)</span>
            </div>

            {product.description && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Size selector */}
            <div className="mb-5">
              <p className="text-foreground font-semibold text-sm mb-3">Escolha a quantidade</p>
              <div className="flex gap-3">
                {sizeOptions.map((size, i) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(i)}
                    className={`flex-1 rounded-lg border-2 p-3 text-center transition-all ${
                      selectedSize === i
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    <p className="font-bold text-sm">{size.pieces} pecas</p>
                    <p className="text-xs mt-0.5 opacity-80">{formatPrice(size.price)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <p className="text-primary font-bold text-4xl mb-6">
              {formatPrice(sizeOptions[selectedSize].price)}
            </p>

            {/* Quantity + Add to cart */}
            <div className="flex gap-3 mb-5">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 text-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-3 text-foreground font-semibold text-sm min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-3 text-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {added ? 'ADICIONADO!' : 'ADICIONAR AO CARRINHO'}
              </button>
            </div>

            {/* Delivery info */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
              <Truck className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-foreground text-sm font-semibold">Entrega rapida</p>
                <p className="text-muted-foreground text-xs">
                  Receba em casa em ate 60 min.{' '}
                  <span className="text-primary cursor-pointer hover:underline">Calcular prazo</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients + Allergens */}
        <div className="grid md:grid-cols-2 gap-10 mb-14">
          <div>
            <h2 className="text-foreground font-bold text-lg mb-5 tracking-wide">INGREDIENTES</h2>
            <div className="flex flex-wrap gap-4">
              {MOCK_INGREDIENTS.map((ing) => (
                <div key={ing.name} className="flex flex-col items-center gap-2 w-16">
                  <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center text-2xl">
                    {ing.emoji}
                  </div>
                  <p className="text-muted-foreground text-[10px] text-center leading-tight">{ing.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-foreground font-bold text-lg mb-5 tracking-wide">ALERGICOS</h2>
            <div className="flex flex-wrap gap-4">
              {MOCK_ALLERGENS.map((al) => (
                <div key={al.name} className="flex flex-col items-center gap-2 w-16">
                  <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center text-2xl">
                    {al.emoji}
                  </div>
                  <p className="text-muted-foreground text-[10px] text-center leading-tight">{al.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground font-bold text-lg tracking-wide">VOCE TAMBEM PODE GOSTAR</h2>
              <Link href="/cardapio" className="text-primary text-sm font-semibold hover:underline">
                VER TODOS &rarr;
              </Link>
            </div>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {relatedProducts.map((p) => {
                  const price = p.promotion_price || p.base_price
                  return (
                    <Link key={p.id} href={`/produto/${p.slug}`} className="flex-shrink-0 w-44">
                      <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all">
                        <div className="relative aspect-square bg-[#111]">
                          <Image
                            src={p.image_url || '/images/sashimi-salmao.png'}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="176px"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-foreground font-semibold text-xs leading-tight mb-0.5 line-clamp-1">{p.name}</p>
                          <p className="text-muted-foreground text-[10px] mb-2">2 unidades</p>
                          <div className="flex items-center justify-between">
                            <p className="text-primary font-bold text-sm">{formatPrice(price)}</p>
                            <button
                              onClick={(e) => e.preventDefault()}
                              className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Plus className="w-3.5 h-3.5 text-primary-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mb-14">
          <h2 className="text-foreground font-bold text-lg tracking-wide mb-6">AVALIACOES DOS CLIENTES</h2>
          <div className="grid md:grid-cols-[auto_1fr] gap-8">
            {/* Score */}
            <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl p-6 min-w-[130px]">
              <p className="text-foreground font-bold text-5xl mb-2">4.8</p>
              <div className="flex mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground text-xs text-center">Com base em 126 avaliacoes</p>
            </div>

            {/* Reviews list */}
            <div className="grid md:grid-cols-3 gap-4">
              {MOCK_REVIEWS.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-foreground font-semibold text-sm">{review.profile?.full_name}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3 h-3 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">{review.comment}</p>
                  <p className="text-muted-foreground/50 text-xs">{timeAgo(review.created_at)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm font-semibold px-8 py-2.5 rounded-lg transition-colors">
              VER TODAS AVALIACOES
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Strip */}
      <div className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Fish, title: 'PEIXES SELECIONADOS', sub: 'Todos os dias' },
              { icon: TruckIcon, title: 'ENTREGA RAPIDA', sub: 'Ate 60 minutos' },
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
