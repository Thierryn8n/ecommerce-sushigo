"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowLeft, Plus, Minus, ShoppingCart, Check, Fish } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import type { Product, ProductVariant, Sauce, ComboProductItem, SushiType } from '@/lib/types'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = params instanceof Promise ? use(params) : params
  const { id } = resolvedParams
  const { addItem } = useCart()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados para seleção
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [selectedMolhos, setSelectedMolhos] = useState<string[]>([])
  const [availableMolhos, setAvailableMolhos] = useState<Sauce[]>([])

  const supabase = createClient()

  // Buscar produto
  useEffect(() => {
    fetchProduct()
    fetchMolhos()
  }, [id])

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug, color),
        variants:product_variants(*),
        combo_items:combo_items(
          *,
          sushi_type:sushi_types(*)
        )
      `)
      .eq('is_active', true)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar produto:', error)
    } else {
      setProduct(data)
      // Selecionar variação padrão se existir
      if (data?.variants && data.variants.length > 0) {
        const defaultVariant = data.variants.find((v: ProductVariant) => v.is_default) || data.variants[0]
        setSelectedVariant(defaultVariant)
      }
    }
    setLoading(false)
  }

  const fetchMolhos = async () => {
    const { data } = await supabase
      .from('sauces')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    setAvailableMolhos(data || [])
  }

  const handleAddToCart = () => {
    if (!product) return

    const price = selectedVariant?.price || product.price || 0
    const pieces = selectedVariant?.quantity_value || product.base_pieces || 1

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      image: product.image_url || '',
      product: product,
      variant: selectedVariant || undefined,
      quantity: quantity,
      notes: notes,
      totalPrice: price * quantity,
      selectedMolhos: selectedMolhos,
      quantityPieces: pieces * quantity,
      comboItems: product.combo_items
    })

    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} (${quantity}x)`,
    })
  }

  const toggleMolho = (molhoId: string) => {
    setSelectedMolhos(prev => 
      prev.includes(molhoId) 
        ? prev.filter(id => id !== molhoId)
        : [...prev, molhoId]
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D62828] border-t-transparent rounded-full" />
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <p className="text-muted-foreground">Produto não encontrado</p>
          <Link href="/cardapio" className="text-[#D62828] hover:underline mt-4 inline-block">
            Ver cardápio
          </Link>
        </div>
      </main>
    )
  }

  const isCombo = product.is_combo
  const hasVariants = product.variants && product.variants.length > 0
  const includesMolhos = product.molhos_included

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link href="/cardapio" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao cardápio
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Imagem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-square bg-muted rounded-3xl overflow-hidden"
            >
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Fish className="w-32 h-32 text-muted-foreground/30" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Categoria */}
              {product.category && (
                <span 
                  className="inline-block px-4 py-1 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: product.category.color || '#D62828', color: '#fff' }}
                >
                  {product.category.name}
                </span>
              )}

              {/* Título */}
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                {product.name}
              </h1>

              {/* Descrição */}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Se for combo, mostrar composição */}
              {isCombo && product.combo_items && product.combo_items.length > 0 && (
                <div className="bg-muted rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center">
                    <Fish className="w-5 h-5 mr-2 text-[#D62828]" />
                    Conteúdo do Combo ({product.base_pieces} peças)
                  </h3>
                  <ul className="space-y-2">
                    {product.combo_items.map((item: ComboProductItem) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.sushi_type?.name}
                        </span>
                        <span className="text-foreground/70">
                          {item.quantity * (item.sushi_type?.pieces_per_serving || 0)} peças
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Variações (ex: Sashimi 5/10/20 peças) */}
              {hasVariants && (
                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block">
                    Escolha a quantidade
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {product.variants?.map((variant: ProductVariant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedVariant?.id === variant.id
                            ? 'border-[#D62828] bg-[#D62828]/10'
                            : 'border-border hover:border-[#D62828]/50'
                        }`}
                      >
                        <div className="font-bold text-foreground">{variant.variant_name}</div>
                        <div className="text-[#D62828] font-semibold">
                          R$ {variant.price.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Molhos (se inclusos) */}
              {includesMolhos && (
                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block">
                    Molhos e Acompanhamentos (grátis)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableMolhos.map((molho: Sauce) => (
                      <button
                        key={molho.id}
                        onClick={() => toggleMolho(molho.id)}
                        className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                          selectedMolhos.includes(molho.id)
                            ? 'border-[#D62828] bg-[#D62828]/10 text-foreground'
                            : 'border-border text-muted-foreground hover:border-[#D62828]/50'
                        }`}
                      >
                        {selectedMolhos.includes(molho.id) && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {molho.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Sem wasabi, shoyu à parte..."
                  className="w-full bg-muted border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground/60 focus:border-[#D62828] focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Quantidade */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  Quantidade
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-[#D62828]/20 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-foreground font-bold text-2xl w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-[#D62828]/20 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preço e Botão */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-3xl font-bold text-[#D62828]">
                    R$ {((selectedVariant?.price || product.price || 0) * quantity).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#D62828] hover:bg-[#C1121F] text-white font-bold py-4 rounded-full text-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar />
    </main>
  )
}

