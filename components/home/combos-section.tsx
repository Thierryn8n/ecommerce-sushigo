"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Combo {
  id: string
  name: string
  slug: string
  description: string | null
  pieces_count: number
  serves_people: number
  price: number
  promotion_price: number | null
  image_url: string | null
}

export function CombosSection() {
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCombos() {
      const supabase = createClient()
      const { data } = await supabase
        .from('combos')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(4)

      if (data) setCombos(data)
      setLoading(false)
    }
    fetchCombos()
  }, [])

  // Dados de exemplo para quando nao houver combos no banco
  const defaultCombos = [
    { id: '1', name: 'COMBO 10 PESSOAS', pieces_count: 250, serves_people: 10, price: 449.90, image_url: '/images/combo-10.png', slug: 'combo-10-pessoas' },
    { id: '2', name: 'COMBO 20 PESSOAS', pieces_count: 500, serves_people: 20, price: 849.90, image_url: '/images/combo-20.png', slug: 'combo-20-pessoas' },
    { id: '3', name: 'COMBO 30 PESSOAS', pieces_count: 750, serves_people: 30, price: 1249.90, image_url: '/images/combo-30.png', slug: 'combo-30-pessoas' },
    { id: '4', name: 'COMBO 40 PESSOAS', pieces_count: 1000, serves_people: 40, price: 1699.90, image_url: '/images/combo-40.png', slug: 'combo-40-pessoas' },
  ]

  const displayCombos = combos.length > 0 ? combos : defaultCombos

  if (loading) {
    return (
      <section className="py-14 bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-foreground">COMBOS PARA TODOS</h2>
            <div className="h-10 w-36 bg-[#1A1A1A] rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-[#1A1A1A]" />
                <div className="p-4 bg-[#141414]">
                  <div className="h-4 bg-[#1A1A1A] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#1A1A1A] rounded w-1/2 mb-3" />
                  <div className="h-6 bg-[#1A1A1A] rounded w-2/3 mb-3" />
                  <div className="h-10 bg-[#1A1A1A] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-14 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl md:text-2xl font-black text-foreground">COMBOS PARA TODOS</h2>
          <Link href="/combos">
            <Button 
              variant="outline" 
              className="border-[#2A2A2A] bg-transparent text-foreground hover:bg-[#1A1A1A] hover:border-primary rounded-md text-xs md:text-sm px-4 md:px-6"
            >
              VER TODOS COMBOS
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayCombos.map((combo, index) => (
            <motion.div
              key={combo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href={`/combo/${combo.slug}`}>
                <div className="group bg-[#141414] rounded-xl overflow-hidden border border-[#2A2A2A] hover:border-primary/50 transition-all duration-300">
                  <div className="relative aspect-square bg-[#1A1A1A] overflow-hidden">
                    <Image
                      src={combo.image_url || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80'}
                      alt={combo.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="text-foreground font-black text-sm md:text-base mb-1">{combo.name}</h3>
                    <p className="text-foreground/50 text-xs md:text-sm mb-3">{combo.pieces_count} Pecas</p>
                    <p className="text-primary font-black text-lg md:text-xl mb-4">
                      R$ {Number(combo.promotion_price || combo.price).toFixed(2).replace('.', ',')}
                    </p>
                    <Button 
                      variant="outline"
                      className="w-full border-[#2A2A2A] bg-transparent text-foreground hover:bg-[#1A1A1A] hover:border-primary font-bold text-xs md:text-sm h-9 md:h-10"
                    >
                      VER DETALHES
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
