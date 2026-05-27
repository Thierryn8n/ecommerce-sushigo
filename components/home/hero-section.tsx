"use client"

import { motion } from 'framer-motion'
import { ArrowRight, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HeroSettings {
  background_image: string
  title_line1: string
  title_line2: string
  subtitle: string
  highlight_text: string
  description: string
  cta_primary: string
  cta_secondary: string
  location_line1: string
  location_line2: string
}

export function HeroSection() {
  const [settings, setSettings] = useState<HeroSettings>({
    background_image: '',
    title_line1: '',
    title_line2: '',
    subtitle: '',
    highlight_text: '',
    description: '',
    cta_primary: '',
    cta_secondary: '',
    location_line1: '',
    location_line2: '',
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient()

      // Buscar store_id atual
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .limit(1)
        .single()

      const query = supabase
        .from('app_settings')
        .select('*')
        .eq('section', 'hero')

      if (storeData?.id) query.eq('store_id', storeData.id)

      const { data } = await query

      if (data) {
        const settingsObj: Partial<HeroSettings> = {}
        data.forEach((item) => {
          if (item.value) settingsObj[item.key as keyof HeroSettings] = item.value
        })
        setSettings(prev => ({ ...prev, ...settingsObj }))
      }
      setLoaded(true)
    }

    fetchSettings()
  }, [])

  // Enquanto carrega, não mostra nada
  if (!loaded) return null

  // Se não tiver nenhum campo preenchido, não mostra a seção
  const hasContent = settings.title_line1 || settings.title_line2 || settings.subtitle ||
    settings.highlight_text || settings.description || settings.background_image

  if (!hasContent) return null

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {settings.background_image && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${settings.background_image}')` }}
        />
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Title */}
            {(settings.title_line1 || settings.title_line2) && (
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4">
                {settings.title_line1 && (
                  <>
                    <span className="text-primary-foreground drop-shadow-2xl" style={{
                      textShadow: '0 0 40px hsl(var(--primary) / 0.5), 0 0 80px hsl(var(--primary) / 0.3)'
                    }}>
                      {settings.title_line1}
                    </span>
                    {settings.title_line2 && <br />}
                  </>
                )}
                {settings.title_line2 && (
                  <span className="text-secondary italic" style={{
                    textShadow: '0 0 40px hsl(var(--secondary) / 0.5)'
                  }}>
                    {settings.title_line2}
                  </span>
                )}
              </h1>
            )}

            {/* Subtitle */}
            {settings.subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 mb-2 font-light"
              >
                {settings.subtitle}
              </motion.p>
            )}
            {settings.highlight_text && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-xl sm:text-2xl md:text-3xl text-secondary font-semibold mb-6"
              >
                {settings.highlight_text}
              </motion.p>
            )}

            {/* Description */}
            {settings.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-base sm:text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto leading-relaxed px-4 sm:px-0"
              >
                {settings.description}
              </motion.p>
            )}

            {/* CTA Buttons */}
            {(settings.cta_primary || settings.cta_secondary) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {settings.cta_primary && (
                  <Link href="/cardapio">
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full transition-all hover:scale-105"
                    >
                      {settings.cta_primary}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )}
                {settings.cta_secondary && (
                  <Link href="/cardapio">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-bold text-lg px-8 py-6 rounded-full transition-all hover:scale-105"
                    >
                      <UtensilsCrossed className="mr-2 w-5 h-5" />
                      {settings.cta_secondary}
                    </Button>
                  </Link>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Location Tag */}
          {(settings.location_line1 || settings.location_line2) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-8 right-8 hidden md:block"
            >
              <div className="text-right">
                {settings.location_line1 && <p className="text-primary-foreground/40 text-sm tracking-widest">{settings.location_line1}</p>}
                {settings.location_line2 && <p className="text-primary-foreground/40 text-sm tracking-widest">{settings.location_line2}</p>}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Thin Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
