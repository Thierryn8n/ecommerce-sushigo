"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  icon_name: string | null
}

// SVG Icons para cada categoria de sushi
const CategoryIcons: Record<string, React.ReactNode> = {
  combos: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect x="6" y="10" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="28" y="10" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="6" y="26" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="28" y="26" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="13" cy="16" r="2" fill="currentColor"/>
      <circle cx="35" cy="16" r="2" fill="currentColor"/>
      <circle cx="13" cy="32" r="2" fill="currentColor"/>
      <circle cx="35" cy="32" r="2" fill="currentColor"/>
    </svg>
  ),
  sashimis: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <ellipse cx="24" cy="28" rx="16" ry="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 28c0-6 7.2-14 16-14s16 8 16 14" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 26c2-4 6-8 12-8s10 4 12 8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
    </svg>
  ),
  niguiris: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <ellipse cx="24" cy="32" rx="14" ry="6" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 32V28c0-2 6-4 14-4s14 2 14 4v4" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="24" cy="22" rx="10" ry="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 22c0-4 4.5-10 10-10s10 6 10 10" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  'hot-empanados': (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <circle cx="24" cy="28" r="12" stroke="currentColor" strokeWidth="2"/>
      <path d="M18 24c2-2 4-3 6-3s4 1 6 3" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 14l2 4M24 10v5M32 14l-2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  uramakis: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="24" r="3" fill="currentColor"/>
      <circle cx="20" cy="18" r="1.5" fill="currentColor"/>
      <circle cx="28" cy="18" r="1.5" fill="currentColor"/>
      <circle cx="18" cy="26" r="1.5" fill="currentColor"/>
      <circle cx="30" cy="26" r="1.5" fill="currentColor"/>
    </svg>
  ),
  hossomakis: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="24" r="2" fill="currentColor"/>
    </svg>
  ),
  'joes-especiais': (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M24 8l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <ellipse cx="24" cy="34" rx="12" ry="5" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 34v-4c0-2 5.4-4 12-4s12 2 12 4v4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  porcoes: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <ellipse cx="24" cy="32" rx="16" ry="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 32v-6c0-3 7.2-6 16-6s16 3 16 6v6" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="24" cy="26" rx="12" ry="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 18l4-6M24 14v-4M32 18l-4-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
}

// Fallback icon
const DefaultIcon = (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
    <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2"/>
    <circle cx="24" cy="24" r="6" fill="currentColor"/>
  </svg>
)

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
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

  const getIcon = (slug: string) => {
    const normalizedSlug = slug.toLowerCase().replace(/_/g, '-')
    return CategoryIcons[normalizedSlug] || DefaultIcon
  }

  if (loading) {
    return (
      <section className="py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-lg font-bold text-foreground mb-10 tracking-widest">NOSSAS CATEGORIAS</h2>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#1A1A1A]" />
                <div className="h-3 w-16 bg-[#1A1A1A] rounded" />
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
        <h2 className="text-center text-lg font-bold text-foreground mb-10 tracking-widest">NOSSAS CATEGORIAS</h2>
        
        <div className="flex justify-center gap-3 md:gap-6 lg:gap-8 flex-wrap max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Link href={`/cardapio?categoria=${category.slug}`}>
                <div 
                  className="group flex flex-col items-center gap-2 cursor-pointer"
                  onMouseEnter={() => setActiveCategory(category.id)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-[#1A1A1A] border-primary text-primary'
                      : 'bg-transparent border-[#2A2A2A] text-foreground/60 hover:border-primary/50 hover:text-foreground'
                  }`}>
                    {getIcon(category.slug)}
                  </div>
                  <span className={`text-[10px] md:text-xs text-center font-semibold tracking-wide transition-colors max-w-[80px] leading-tight ${
                    activeCategory === category.id ? 'text-foreground' : 'text-foreground/60'
                  }`}>
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
