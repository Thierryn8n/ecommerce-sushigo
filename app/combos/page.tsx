"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { createClient } from '@/lib/supabase/client'

interface Combo {
  id: string
  name: string
  slug: string
  description: string | null
  original_price: number
  promo_price: number
  image_url: string | null
}

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    async function fetchCombos() {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('combos')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (data) {
        setCombos(data)
      }
      setLoading(false)
    }

    fetchCombos()
  }, [])

  const handleAddCombo = (combo: Combo) => {
    addItem({
      id: crypto.randomUUID(),
      productId: combo.id,
      name: combo.name,
      image: combo.image_url || '',
      basePrice: Number(combo.promo_price),
      totalPrice: Number(combo.promo_price),
      quantity: 1,
      toppings: [],
      sauces: [],
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-primary/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Combos <span className="text-secondary">Especiais</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Mais sabor por um preco incrivel! Aproveite nossas ofertas especiais.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Combos Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-3xl overflow-hidden">
                  <div className="aspect-[4/3] bg-muted-foreground/10"></div>
                  <div className="p-6">
                    <div className="h-8 bg-muted-foreground/10 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted-foreground/10 rounded w-full mb-4"></div>
                    <div className="h-10 bg-muted-foreground/10 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : combos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {combos.map((combo, index) => (
                <motion.div
                  key={combo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="group bg-gradient-to-br from-primary to-primary/80 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform">
                    <div className="relative aspect-[4/3] p-6">
                      <Image
                        src={combo.image_url || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png'}
                        alt={combo.name}
                        fill
                        className="object-contain p-8 group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-sm font-bold px-4 py-2 rounded-full animate-pulse">
                        OFERTA
                      </div>
                    </div>
                    <div className="p-6 bg-card">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{combo.name}</h3>
                      <p className="text-muted-foreground mb-4">{combo.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground text-sm line-through block">
                            De R$ {Number(combo.original_price).toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-primary font-bold text-2xl">
                            R$ {Number(combo.promo_price).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <Button 
                          onClick={() => handleAddCombo(combo)}
                          className="bg-secondary hover:bg-secondary/90 rounded-full"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Pedir
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">Nenhum combo disponivel no momento</p>
              <Link href="/cardapio">
                <Button className="bg-primary hover:bg-primary/90">
                  Ver Cardapio
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-secondary to-secondary/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-secondary-foreground mb-4">
            Quer mais opcoes?
          </h2>
          <p className="text-secondary-foreground/80 mb-6">
            Confira nosso cardapio completo e monte seu acai do seu jeito!
          </p>
          <Link href="/cardapio">
            <Button className="bg-background hover:bg-background/90 text-foreground font-bold px-8 py-3 rounded-full">
              Ver Cardapio Completo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      <CartSidebar />
    </main>
  )
}
