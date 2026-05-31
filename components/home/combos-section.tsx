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

  if (loading) {
    return (
      <section className="py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-foreground">COMBOS PARA TODOS</h2>
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-foreground tracking-wide">COMBOS PARA TODOS</h2>
          <Link href="/combos">
            <Button variant="outline" className="border-border text-foreground hover:bg-muted rounded-lg text-sm">
              VER TODOS COMBOS
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {combos.map((combo, index) => (
            <motion.div
              key={combo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href={`/combo/${combo.slug}`}>
                <div className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all">
                  {/* Image */}
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={combo.image_url || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80'}
                      alt={combo.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-foreground font-bold text-sm mb-1">{combo.name.toUpperCase()}</h3>
                    <p className="text-foreground/50 text-xs mb-2">{combo.pieces_count} Pecas</p>
                    <p className="text-primary font-bold text-lg">
                      R$ {Number(combo.promotion_price || combo.price).toFixed(2).replace('.', ',')}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full mt-3 border-border text-foreground hover:bg-muted text-xs h-9"
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
