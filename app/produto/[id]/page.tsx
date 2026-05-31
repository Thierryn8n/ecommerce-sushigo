"use client"

import { useState, useEffect, useRef, use, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, Plus, Minus, ShoppingCart, Sparkles, Wand2 } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  category: { name: string; slug: string; color: string | null } | null
  base_weight_grams: number
}

interface Bowl {
  id: string
  name: string
  ml: number
  max_weight: number | null
  bowl_type: string | null
  is_special: boolean
  image_url: string | null
}

interface AcaiType {
  id: string
  name: string
  description: string | null
  weight_addition: number
  price_per_kg: number
  image_url: string | null
}

interface Topping {
  id: string
  name: string
  category: string
  max_quantity: number
  image_url?: string
  weight_grams: number
}

interface Sauce {
  id: string
  name: string
  weight_grams: number
}

const STEPS = [
  { id: 1, name: 'Tamanho', description: 'Escolha a vasilha' },
  { id: 2, name: 'Tipo de Acai', description: 'Escolha o sabor base' },
  { id: 3, name: 'Adicionais', description: 'Escolha os condimentos' },
  { id: 4, name: 'Coberturas', description: 'Escolha as coberturas' },
  { id: 5, name: 'Finalizar', description: 'Observacoes e carrinho' },
]

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { addItem } = useCart()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [bowls, setBowls] = useState<Bowl[]>([])
  const [acaiTypes, setAcaiTypes] = useState<AcaiType[]>([])
  const [toppings, setToppings] = useState<Topping[]>([])
  const [sauces, setSauces] = useState<Sauce[]>([])
  const [loading, setLoading] = useState(true)

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedBowl, setSelectedBowl] = useState<string | null>(null)
  const manualBowlSelection = useRef(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedToppings, setSelectedToppings] = useState<Record<string, number>>({})
  const [autoToppings, setAutoToppings] = useState<Set<string>>(new Set()) // Toppings automáticos (inclusos no preço)
  const [selectedSauces, setSelectedSauces] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Funcao para analisar descricao e preencher automaticamente - DEFINIDA ANTES DO USEEFFECT
  const analyzeDescriptionAndFill = useCallback((
    description: string, 
    availableTypes: AcaiType[], 
    availableToppings: Topping[]
  ) => {
    const descLower = description.toLowerCase()
    const autoSelected: string[] = []
    
    // 1. Procurar tipo de acai na descricao
    const matchedType = availableTypes.find(type => 
      descLower.includes(type.name.toLowerCase()) ||
      (type.description && descLower.includes(type.description.toLowerCase()))
    )
    
    if (matchedType) {
      setSelectedType(matchedType.id)
      autoSelected.push(`Tipo: ${matchedType.name}`)
    }
    
    // 2. Procurar adicionais/toppings na descricao
    const matchedToppings: Record<string, number> = {}
    const matchedToppingNames: string[] = []
    const autoToppingIds = new Set<string>()
    
    availableToppings.forEach(topping => {
      const toppingNameLower = topping.name.toLowerCase()
      if (descLower.includes(toppingNameLower)) {
        matchedToppings[topping.id] = 1
        matchedToppingNames.push(topping.name)
        autoToppingIds.add(topping.id)
      }
    })
    
    if (Object.keys(matchedToppings).length > 0) {
      setSelectedToppings(matchedToppings)
      setAutoToppings(autoToppingIds)
      autoSelected.push(...matchedToppingNames.map(name => `Adicional: ${name}`))
    }
    
    // Mostrar toast se algo foi selecionado automaticamente
    if (autoSelected.length > 0) {
      toast({
        title: "✨ Itens selecionados automaticamente",
        description: `Baseado na descrição: ${autoSelected.slice(0, 3).join(', ')}${autoSelected.length > 3 ? ` e mais ${autoSelected.length - 3}` : ''}`,
        duration: 4000,
      })
    }
  }, [toast])

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Buscar produto por ID ou slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      
      const { data: productData } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug, color)
        `)
        .eq(isUuid ? 'id' : 'slug', id)
        .single()

      if (productData) {
        setProduct(productData)
      }

      // Buscar vasilhas
      const { data: bowlsData } = await supabase
        .from('bowls')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (bowlsData) {
        setBowls(bowlsData)
      }

      // Buscar tipos de acai
      const { data: acaiTypesData } = await supabase
        .from('acai_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (acaiTypesData) {
        setAcaiTypes(acaiTypesData)
      }

      // Buscar toppings
      const { data: toppingsData } = await supabase
        .from('toppings')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (toppingsData) {
        setToppings(toppingsData)
        
        // Analisar descrição do produto e preencher automaticamente
        if (productData?.description) {
          analyzeDescriptionAndFill(productData.description, acaiTypesData || [], toppingsData || [])
        }
      }

      // Buscar coberturas da tabela toppings com category='cobertura'
      const { data: saucesData } = await supabase
        .from('toppings')
        .select('*')
        .eq('category', 'cobertura')
        .eq('is_active', true)
        .order('display_order')

      if (saucesData) {
        setSauces(saucesData.map((s: any) => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          weight_grams: Number(s.weight_grams) || 0,
        })))
      }

      setLoading(false)
    }

    fetchData()
  }, [id])

  // Auto-select bowl when ingredients change (ignores special bowls and manual selection)
  useEffect(() => {
    if (bowls.length === 0) return
    if (manualBowlSelection.current) return

    const currentType = acaiTypes.find(t => t.id === selectedType)

    const weight = (product?.base_weight_grams || 0) +
      (currentType?.weight_addition || 0) +
      Object.entries(selectedToppings).reduce((sum, [tid, qty]) => {
        const t = toppings.find(tp => tp.id === tid)
        return sum + ((t?.weight_grams || 0) * qty)
      }, 0) +
      selectedSauces.reduce((sum, sid) => {
        const s = sauces.find(sa => sa.id === sid)
        return sum + (s?.weight_grams || 0)
      }, 0)

    const sortedBowls = [...bowls]
      .filter(b => !b.is_special && b.max_weight != null && b.max_weight > 0)
      .sort((a, b) => (a.max_weight || 0) - (b.max_weight || 0))

    let selected = sortedBowls.find(b => (b.max_weight || 0) >= weight)
    if (!selected && sortedBowls.length > 0) {
      selected = sortedBowls[sortedBowls.length - 1]
    }

    if (selected && selected.id !== selectedBowl) {
      setSelectedBowl(selected.id)
    }
  }, [selectedToppings, selectedSauces, selectedType, product, toppings, sauces, bowls, acaiTypes, selectedBowl])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="animate-pulse">
                <div className="bg-card rounded-3xl p-6 border border-border">
                  <div className="aspect-square bg-muted rounded-2xl mb-6"></div>
                  <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-4"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </div>
              <div className="animate-pulse">
                <div className="h-12 bg-muted rounded mb-8"></div>
                <div className="bg-card rounded-3xl p-6 border border-border">
                  <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-24 bg-muted rounded-xl"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produto nao encontrado</h1>
          <Link href="/cardapio">
            <Button className="bg-[#FF8C00] hover:bg-[#FFC300]">
              Voltar ao Cardapio
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  const bowl = bowls.find(b => b.id === selectedBowl)
  const acaiType = acaiTypes.find(t => t.id === selectedType)

  // Calculate weight of ingredients only (bowl max_weight is reference, not added)
  const calculateIngredientsWeight = () => {
    let weight = product?.base_weight_grams || 0
    if (acaiType) weight += acaiType.weight_addition || 0
    
    Object.entries(selectedToppings).forEach(([toppingId, qty]) => {
      const topping = toppings.find(t => t.id === toppingId)
      if (topping) weight += (topping.weight_grams || 0) * qty
    })
    
    selectedSauces.forEach(sauceId => {
      const sauce = sauces.find(s => s.id === sauceId)
      if (sauce) weight += sauce.weight_grams || 0
    })
    
    // Arredonda para multiplo de 50g (aproximado)
    return Math.ceil(weight / 50) * 50
  }

  // Calculate total weight in grams
  const calculateWeight = () => {
    return calculateIngredientsWeight()
  }

  // Calculate total price (apenas por peso do tipo de acai)
  const calculateTotal = () => {
    const typePricePerKg = acaiType?.price_per_kg || 0
    const weight = calculateWeight()
    return (weight / 1000) * typePricePerKg
  }

  const totalPrice = calculateTotal()
  const totalWeight = calculateWeight()

  const handleAddToCart = () => {
    const selectedToppingsList = Object.entries(selectedToppings)
      .filter(([, qty]) => qty > 0)
      .map(([toppingId, qty]) => {
        const topping = toppings.find(t => t.id === toppingId)
        return { name: `${topping?.name} (${qty}x)` }
      })

    const selectedSaucesList = selectedSauces.map(sauceId => {
      const sauce = sauces.find(s => s.id === sauceId)
      return { name: sauce?.name || '' }
    })

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      image: product.image_url || '',
      totalPrice,
      quantity,
      size: bowl?.name,
      sizeML: bowl?.ml,
      acaiType: acaiType?.name,
      toppings: selectedToppingsList,
      sauces: selectedSaucesList,
      notes,
      weightGrams: totalWeight,
    })

    // Reset form
    setCurrentStep(1)
    setSelectedBowl(null)
    manualBowlSelection.current = false
    setSelectedType(null)
    setSelectedToppings({})
    setSelectedSauces([])
    setNotes('')
    setQuantity(1)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedBowl !== null
      case 2: return selectedType !== null
      default: return true
    }
  }

  const toggleTopping = (toppingId: string, maxQty: number) => {
    setSelectedToppings(prev => {
      const current = prev[toppingId] || 0
      if (current >= maxQty) {
        const { [toppingId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [toppingId]: current + 1 }
    })
  }

  const decreaseTopping = (toppingId: string) => {
    setSelectedToppings(prev => {
      const current = prev[toppingId] || 0
      if (current <= 1) {
        const { [toppingId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [toppingId]: current - 1 }
    })
  }

  const toggleSauce = (sauceId: string) => {
    setSelectedSauces(prev => 
      prev.includes(sauceId) 
        ? prev.filter(sid => sid !== sauceId)
        : [...prev, sauceId]
    )
  }

  const toppingCategories = [
    { id: 'fruta', name: 'Frutas', slug: 'fruta' },
    { id: 'granola', name: 'Granolas', slug: 'granola' },
    { id: 'calda', name: 'Caldas', slug: 'calda' },
    { id: 'extra', name: 'Extras', slug: 'extra' },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-28 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link href="/cardapio" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Cardapio
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {/* Product Info */}
            <div className="order-1 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 border border-border lg:sticky lg:top-28"
              >
                <div className="relative aspect-square sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-card mb-4 sm:mb-6">
                  <Image
                    src={
                      bowl?.name?.toLowerCase().includes('coco') && bowl?.image_url
                        ? bowl.image_url
                        : product.image_url || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png'
                    }
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                <p className="text-muted-foreground text-sm sm:text-base mb-4">{product.description}</p>

                {/* Price Display */}
                <div className="bg-muted rounded-xl p-3 sm:p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground text-sm sm:text-base">Total do Pedido</span>
                      {(acaiType?.price_per_kg || 0) > 0 && (
                        <p className="text-xs text-muted-foreground/70">{totalWeight}g = {(totalWeight / 1000).toFixed(2).replace('.', ',').replace(/,00$/g, '').replace(/([1-9])0$/g, '$1')}kg</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[#00BFFF] font-bold text-xl sm:text-2xl">
                        R$ {(totalPrice * quantity).toFixed(2).replace('.', ',')}
                      </p>
                      {quantity > 1 && (
                        <p className="text-muted-foreground/70 text-sm">
                          {quantity}x R$ {totalPrice.toFixed(2).replace('.', ',')}
                        </p>
                      )}
                      {(acaiType?.price_per_kg || 0) > 0 && (
                        <p className="text-[10px] text-muted-foreground/60">R$ {acaiType?.price_per_kg || 0}/kg</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  {(acaiType?.price_per_kg || 0) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Peso Total:</span>
                      <span className="text-foreground font-semibold">{totalWeight}g ({(totalWeight / 1000).toFixed(2).replace('.', ',').replace(/,00$/g, '').replace(/([1-9])0$/g, '$1')}kg)</span>
                    </div>
                  )}
                  {bowl && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tamanho:</span>
                        <span className="text-foreground">{bowl.name}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Limite:</span>
                        <span className={`font-semibold ${totalWeight > (bowl.max_weight || 0) ? 'text-red-400' : totalWeight > (bowl.max_weight || 0) * 0.8 ? 'text-[#FFC300]' : 'text-foreground'}`}>
                          {bowl.max_weight || 0}g
                        </span>
                      </div>
                      {totalWeight > (bowl.max_weight || 0) && (
                        <div className="text-red-400 text-xs bg-red-500/10 rounded-lg p-2 mt-1">
                          <p>Peso excede o limite da vasilha! ({totalWeight}g / {bowl.max_weight}g)</p>
                          {/* Mini seção com vasilias adequadas */}
                          {(() => {
                            const options = bowls
                              .filter(b => b.max_weight != null && b.max_weight > 0 && b.max_weight >= totalWeight)
                              .sort((a, b) => (a.max_weight || 0) - (b.max_weight || 0))
                              .slice(0, 3)
                            return options.length > 0 ? (
                              <div className="mt-2">
                                <p className="text-[10px] mb-1 font-semibold">Vasilhas recomendadas:</p>
                                <div className="flex gap-1.5">
                                  {options.map(b => (
                                    <button
                                      key={b.id}
                                      onClick={() => {
                                        manualBowlSelection.current = true
                                        setSelectedBowl(b.id)
                                      }}
                                      className={`flex-1 p-1.5 rounded-md border text-[10px] leading-tight text-center transition-colors ${
                                        selectedBowl === b.id
                                          ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-foreground'
                                          : 'border-red-400/30 bg-red-500/5 text-red-300 hover:border-[#FF8C00]/50'
                                      }`}
                                    >
                                      <span className="block font-semibold text-foreground">{b.name}</span>
                                      <span className="block text-[9px]">ate {b.max_weight}g</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] mt-1 opacity-80">Nenhuma vasilha comporta este peso.</p>
                            )
                          })()}
                        </div>
                      )}
                      {totalWeight > (bowl.max_weight || 0) * 0.8 && totalWeight <= (bowl.max_weight || 0) && (
                        <div className="text-[#FFC300] text-xs bg-[#FFC300]/10 rounded-lg p-2 mt-1">
                          Peso proximo do limite ({totalWeight}g / {bowl.max_weight}g)
                        </div>
                      )}
                    </>
                  )}
                  {acaiType && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tipo:</span>
                      <span className="text-foreground">{acaiType.name}</span>
                    </div>
                  )}
                  {Object.keys(selectedToppings).length > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Adicionais:</span>
                      <span className="text-foreground">{Object.keys(selectedToppings).length} itens</span>
                    </div>
                  )}
                  {selectedSauces.length > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Coberturas:</span>
                      <span className="text-foreground">{selectedSauces.length} itens</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Steps */}
            <div>
              {/* Step Indicator - Mobile Optimized */}
              <div className="mb-8">
                {/* Mobile: Simple dots indicator */}
                <div className="flex md:hidden items-center justify-center gap-2 mb-4">
                  {STEPS.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        currentStep === step.id
                          ? 'bg-[#FF8C00] w-6'
                          : currentStep > step.id
                          ? 'bg-[#00BFFF]'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="md:hidden text-center text-foreground font-medium text-sm mb-4">
                  {STEPS[currentStep - 1]?.name}
                </p>

                {/* Desktop: Full step indicator */}
                <div className="hidden md:flex items-center justify-between overflow-x-auto pb-4">
                  {STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <button
                        onClick={() => setCurrentStep(step.id)}
                        className={`flex flex-col items-center min-w-[80px] ${
                          currentStep === step.id ? 'opacity-100' : 'opacity-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                          currentStep > step.id
                            ? 'bg-[#00BFFF] text-foreground'
                            : currentStep === step.id
                            ? 'bg-[#FF8C00] text-foreground'
                            : 'bg-muted text-muted-foreground/70'
                        }`}>
                          {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                        </div>
                        <span className="text-foreground text-xs text-center whitespace-nowrap">{step.name}</span>
                      </button>
                      {index < STEPS.length - 1 && (
                        <div className={`h-0.5 w-8 mx-2 flex-shrink-0 ${
                          currentStep > step.id ? 'bg-[#00BFFF]' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-border"
                >
                  {/* Step 1: Bowl Selection */}
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Escolha o Tamanho</h2>
                      <p className="text-foreground/60 mb-3 sm:mb-6">Selecione a vasilha do seu acai</p>
                      {/* Vasilias normais (auto-select) */}
                      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
                        {bowls.filter(b => !b.is_special).map((bowlItem) => (
                          <button
                            key={bowlItem.id}
                            onClick={() => {
                              manualBowlSelection.current = true
                              setSelectedBowl(bowlItem.id)
                            }}
                            className={`p-2 sm:p-4 rounded-xl border-2 transition-all ${
                              selectedBowl === bowlItem.id
                                ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                                : 'border-border hover:border-[#8A2BE2]/50'
                            }`}
                          >
                            <div className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-2 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {bowlItem.image_url ? (
                                <Image
                                  src={bowlItem.image_url}
                                  alt={bowlItem.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xl sm:text-3xl">
                                  {bowlItem.bowl_type === 'tigela' ? '🥣' : bowlItem.bowl_type === 'barco' ? '🛶' : '🥤'}
                                </span>
                              )}
                            </div>
                            <p className="text-foreground font-semibold text-xs leading-tight">{bowlItem.name}</p>
                            <p className="text-muted-foreground/70 text-[10px] sm:text-xs">ate {bowlItem.max_weight}g</p>
                          </button>
                        ))}
                      </div>
                      {/* Vasilias especiais */}
                      {bowls.some(b => b.is_special) && (
                        <>
                          <h3 className="text-lg font-bold text-foreground mt-6 mb-2">Vasilhas Especiais</h3>
                          <p className="text-foreground/60 mb-3 sm:mb-4 text-sm">Opcionais — selecione manualmente</p>
                          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
                            {bowls.filter(b => b.is_special).map((bowlItem) => (
                              <button
                                key={bowlItem.id}
                                onClick={() => {
                                  manualBowlSelection.current = true
                                  setSelectedBowl(bowlItem.id)
                                }}
                                className={`p-2 sm:p-4 rounded-xl border-2 transition-all ${
                                  selectedBowl === bowlItem.id
                                    ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                                    : 'border-border hover:border-[#8A2BE2]/50'
                                }`}
                              >
                                <div className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-2 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                  {bowlItem.image_url ? (
                                    <Image
                                      src={bowlItem.image_url}
                                      alt={bowlItem.name}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xl sm:text-3xl">
                                      {bowlItem.bowl_type === 'tigela' ? '🥣' : bowlItem.bowl_type === 'barco' ? '🛶' : '🥤'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-foreground font-semibold text-xs leading-tight">{bowlItem.name}</p>
                                <p className="text-muted-foreground/70 text-[10px] sm:text-xs">ate {bowlItem.max_weight}g</p>
                                <span className="text-[10px] text-[#FF8C00] font-semibold">Especial</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Step 2: Acai Type Selection */}
                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Tipo de Acai</h2>
                      <p className="text-foreground/60 mb-3 sm:mb-6">Escolha o sabor base do seu acai</p>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                        {acaiTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`p-2 sm:p-4 rounded-xl border-2 transition-all text-left ${
                              selectedType === type.id
                                ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                                : 'border-border hover:border-[#8A2BE2]/50'
                            }`}
                          >
                            {type.image_url && (
                              <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={type.image_url}
                                  alt={type.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <p className="text-foreground font-semibold text-xs sm:text-sm">{type.name}</p>
                            {type.description && (
                              <p className="text-muted-foreground/70 text-[10px] sm:text-xs mt-0.5 line-clamp-1 sm:line-clamp-2">{type.description}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Toppings */}
                  {currentStep === 3 && (
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Adicionais</h2>
                      <p className="text-foreground/60 mb-6">Escolha seus condimentos favoritos</p>
                      <div className="space-y-6">
                        {toppingCategories.map((category) => {
                          const categoryToppings = toppings.filter(t => {
                            const toppingCat = (t.category || '').toLowerCase()
                            const catName = category.name.toLowerCase()
                            const catSlug = (category.slug || '').toLowerCase()
                            return toppingCat === catName || toppingCat === catSlug || toppingCat === catName.slice(0, -1) // remove 's' do final se existir
                          })
                          if (categoryToppings.length === 0) return null
                          return (
                            <div key={category.id}>
                              <h3 className="text-[#FFC300] font-semibold mb-3">{category.name}</h3>
                              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
                                {categoryToppings.map((topping) => {
                                  const qty = selectedToppings[topping.id] || 0
                                  const isAuto = autoToppings.has(topping.id)
                                  return (
                                    <div
                                      key={topping.id}
                                      className={`p-2 rounded-lg border-2 transition-all ${
                                        qty > 0
                                          ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                                          : 'border-border'
                                      }`}
                                    >
                                      <div className="flex flex-col items-center text-center">
                                        {topping.image_url ? (
                                          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted mb-1">
                                            <Image
                                              src={topping.image_url}
                                              alt={topping.name}
                                              fill
                                              className="object-cover"
                                              sizes="96px"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-muted flex items-center justify-center mb-1">
                                            <span className="text-2xl">🍨</span>
                                          </div>
                                        )}
                                        <p className="text-foreground text-xs font-medium leading-tight mb-0.5">{topping.name}</p>
                                        <p className="text-[#FF8C00] text-[10px] mb-1">{topping.weight_grams}g</p>
                                        <div className="flex items-center justify-center">
                                          <div className="flex items-center gap-0.5 bg-primary/10 border border-primary/20 rounded-full px-1.5 py-0.5">
                                            {qty > 0 && (
                                              <button
                                                onClick={() => decreaseTopping(topping.id)}
                                                className="w-5 h-5 rounded-full bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                                              >
                                                <Minus className="w-3 h-3" />
                                              </button>
                                            )}
                                            {qty > 0 && (
                                              <span className="text-foreground font-semibold w-3 text-center text-xs">{qty}</span>
                                            )}
                                            <button
                                              onClick={() => toggleTopping(topping.id, topping.max_quantity)}
                                              disabled={qty >= topping.max_quantity}
                                              className={`w-5 h-5 rounded-full flex items-center justify-center text-primary-foreground transition-colors ${
                                                qty >= topping.max_quantity
                                                  ? 'bg-muted opacity-50 cursor-not-allowed'
                                                  : 'bg-primary hover:bg-primary/90'
                                              }`}
                                            >
                                              <Plus className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                        {toppings.length === 0 && (
                          <p className="text-muted-foreground/70 text-center py-8">Nenhum adicional disponivel no momento</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Sauces */}
                  {currentStep === 4 && (
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Coberturas</h2>
                      <p className="text-foreground/60 mb-3 sm:mb-6">Escolha suas coberturas favoritas</p>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                        {sauces.map((sauce) => (
                          <button
                            key={sauce.id}
                            onClick={() => toggleSauce(sauce.id)}
                            className={`p-2 sm:p-4 rounded-xl border-2 transition-all text-left ${
                              selectedSauces.includes(sauce.id)
                                ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                                : 'border-border hover:border-[#8A2BE2]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-foreground font-semibold text-xs sm:text-sm">{sauce.name}</p>
                              </div>
                              {selectedSauces.includes(sauce.id) && (
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF8C00] flex-shrink-0 ml-1 sm:ml-2" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      {sauces.length === 0 && (
                        <p className="text-muted-foreground/70 text-center py-8">Nenhuma cobertura disponivel no momento</p>
                      )}
                    </div>
                  )}

                  {/* Step 5: Notes & Add to Cart */}
                  {currentStep === 5 && (
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Finalizar Pedido</h2>
                      <p className="text-foreground/60 mb-6">Adicione observacoes se necessario</p>
                      
                      <div className="mb-6">
                        <label className="text-muted-foreground text-sm mb-2 block">Observacoes (opcional)</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Ex: Sem gelo, mais doce, etc..."
                          className="w-full bg-muted border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground/60 focus:border-[#8A2BE2] focus:outline-none resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="mb-6">
                        <label className="text-muted-foreground text-sm mb-2 block">Quantidade</label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-[#5B1E87] transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="text-foreground font-bold text-2xl w-12 text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-[#5B1E87] transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddToCart}
                        className="w-full bg-[#FF8C00] hover:bg-[#FFC300] text-foreground font-bold py-4 rounded-full text-lg"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Adicionar ao Carrinho
                      </Button>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-6">
                    {currentStep > 1 && (
                      <Button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        variant="outline"
                        className="flex-1 border-border text-foreground hover:bg-muted"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar
                      </Button>
                    )}
                    {currentStep < 5 && (
                      <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={!canProceed()}
                        className="flex-1 bg-[#8A2BE2] hover:bg-[#5B1E87] text-foreground disabled:opacity-50"
                      >
                        Continuar
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar />
    </main>
  )
}
