"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Package, Fish, Utensils, Flame, Circle, Minus, Star, UtensilsCrossed } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon_name: string | null
}

const iconMap: Record<string, React.ReactNode> = {
  package: <Package className="w-8 h-8" />,
  fish: <Fish className="w-8 h-8" />,
  utensils: <Utensils className="w-8 h-8" />,
  flame: <Flame className="w-8 h-8" />,
  circle: <Circle className="w-8 h-8" />,
  minus: <Minus className="w-8 h-8" />,
  star: <Star className="w-8 h-8" />,
  'utensils-crossed': <UtensilsCrossed className="w-8 h-8" />,
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, icon_name')
        .eq('is_active', true)
        .order('display_order')

      if (data) setCategories(data)
      setLoading(false)
    }
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-xl font-bold text-foreground mb-8">NOSSAS CATEGORIAS</h2>
          <div className="flex justify-center gap-6 flex-wrap">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                <div className="w-16 h-16 rounded-xl bg-muted" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-xl font-bold text-foreground mb-8 tracking-wide">NOSSAS CATEGORIAS</h2>
        
        <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Link href={`/cardapio?categoria=${category.slug}`}>
                <div className="group flex flex-col items-center gap-2 cursor-pointer">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground/70 group-hover:border-primary group-hover:text-primary transition-all">
                    {iconMap[category.icon_name || 'utensils'] || <Utensils className="w-8 h-8" />}
                  </div>
                  <span className="text-xs md:text-sm text-foreground/70 group-hover:text-foreground transition-colors text-center font-medium">
                    {category.name.toUpperCase()}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
