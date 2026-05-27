"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  color: string | null
  display_order: number
}

interface AppSettings {
  [key: string]: string
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<AppSettings>({})
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

      // Buscar configurações da home
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('section', 'home')

      if (settingsData) {
        const settingsObj: AppSettings = {}
        settingsData.forEach((item) => {
          settingsObj[item.key] = item.value || ''
        })
        setSettings(settingsObj)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/3">
              <div className="animate-pulse">
                <div className="h-4 bg-muted-foreground/20 rounded w-32 mb-2"></div>
                <div className="h-10 bg-muted-foreground/20 rounded w-64 mb-4"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-full mb-6"></div>
                <div className="h-12 bg-muted-foreground/20 rounded-full w-40"></div>
              </div>
            </div>
            <div className="lg:w-2/3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted-foreground/10 rounded-2xl mb-3"></div>
                    <div className="h-4 bg-muted-foreground/10 rounded w-20 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Content */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-secondary text-sm font-semibold tracking-wider mb-2">
                {settings.categories_subtitle || 'MONTE DO SEU JEITO'}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {settings.categories_title ? (
                  <>
                    {settings.categories_title.split(' ').slice(0, 3).join(' ')}<br />
                    <span className="text-primary">{settings.categories_title.split(' ').slice(3).join(' ')}</span>
                  </>
                ) : (
                  <>
                    Escolha o seu<br />
                    <span className="text-primary">Acai Perfeito!</span>
                  </>
                )}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {settings.categories_description || 'Monte do seu jeito com os melhores acompanhamentos e crie a combinacao perfeita para voce!'}
              </p>
              <Link href="/cardapio">
                <Button 
                  className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-6 py-3 rounded-full transition-all"
                >
                  <UtensilsCrossed className="mr-2 w-5 h-5" />
                  MONTAR AGORA
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Categories Grid */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/cardapio?categoria=${category.slug}`}>
                    <div className="group cursor-pointer">
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-card border border-border hover:border-primary transition-all hover:scale-105">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={category.image_url || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png'}
                            alt={category.name}
                            width={80}
                            height={80}
                            className="object-contain group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                          style={{ backgroundColor: category.color || 'hsl(var(--primary))' }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-foreground font-bold text-sm">
                          {category.name.includes(' ') ? category.name.split(' ')[0] : category.name}
                        </p>
                        <p 
                          className="text-xs font-semibold"
                          style={{ color: category.color || 'hsl(var(--primary))' }}
                        >
                          {category.name.includes(' ') ? category.name.split(' ').slice(1).join(' ') : category.slug.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
