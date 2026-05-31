"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Leaf, Truck, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AppSettings {
  [key: string]: string
}

const iconMap: { [key: string]: any } = {
  check: Check,
  leaf: Leaf,
  truck: Truck,
  card: CreditCard,
}

export function BenefitsSection() {
  const [settings, setSettings] = useState<AppSettings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Buscar configurações dos benefícios
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('section', 'benefits')

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

  const benefits = [
    {
      icon: Check,
      title: settings.benefit_1_title || 'Ingredientes Selecionados',
      description: settings.benefit_1_subtitle || 'Sempre frescos',
      color: 'hsl(var(--secondary))'
    },
    {
      icon: Leaf,
      title: settings.benefit_2_title || 'Sushi 100% Fresco',
      description: settings.benefit_2_subtitle || 'Puro e saudavel',
      color: 'hsl(var(--secondary))'
    },
    {
      icon: Truck,
      title: settings.benefit_3_title || 'Entrega Rapida',
      description: settings.benefit_3_subtitle || 'Chegou, pediu!',
      color: 'hsl(var(--secondary))'
    },
    {
      icon: CreditCard,
      title: settings.benefit_4_title || 'Pagamento Seguro',
      description: settings.benefit_4_subtitle || 'Ambiente protegido',
      color: 'hsl(var(--secondary))'
    }
  ]

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-r from-muted via-muted/50 to-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-muted-foreground/10"></div>
                <div>
                  <div className="h-4 bg-muted-foreground/10 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-muted-foreground/10 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-6 sm:py-8 bg-gradient-to-r from-muted via-muted/50 to-muted">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3 p-3 sm:p-0 bg-card/50 sm:bg-transparent rounded-xl sm:rounded-none"
            >
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `hsl(var(--secondary) / 0.2)` }}
              >
                <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <div>
                <h4 className="text-foreground font-semibold text-xs sm:text-sm leading-tight">{benefit.title}</h4>
                <p className="text-muted-foreground text-[10px] sm:text-xs">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
