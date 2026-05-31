"use client"

import { motion } from 'framer-motion'
import { Phone, Truck, Fish, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store-context'

interface HeroSettings {
  title_line1: string
  title_line2: string
  subtitle: string
  description: string
  cta_primary: string
  cta_secondary: string
}

export function HeroSection() {
  const { store } = useStore()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [settings, setSettings] = useState<HeroSettings>({
    title_line1: 'O MELHOR SUSHI,',
    title_line2: 'ONDE VOCE ESTIVER.',
    subtitle: 'Peixes selecionados, ingredientes frescos',
    description: 'e o verdadeiro sabor da culinaria japonesa na sua casa.',
    cta_primary: 'PEDIR AGORA',
    cta_secondary: 'VER CARDAPIO',
  })

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient()
      const { data } = await supabase
        .from('app_settings')
        .select('*')
        .eq('section', 'hero')

      if (data) {
        const settingsObj: Partial<HeroSettings> = {}
        data.forEach((item) => {
          settingsObj[item.key as keyof HeroSettings] = item.value || ''
        })
        setSettings(prev => ({ ...prev, ...settingsObj }))
      }
    }
    fetchSettings()
  }, [])

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const whatsappNumber = store?.whatsapp_number?.replace(/\D/g, '') || '5585999999999'

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0A0A0A]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1920&q=80"
          alt="Sushi background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight italic">
              <span className="text-foreground">{settings.title_line1}</span>
              <br />
              <span className="text-primary">{settings.title_line2.split(' ')[0]}</span>
              <span className="text-foreground"> {settings.title_line2.split(' ').slice(1).join(' ')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-foreground/70 text-base md:text-lg mb-8 leading-relaxed max-w-md">
              {settings.subtitle}
              <br />
              {settings.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-8 py-6 rounded-lg gap-2 w-full sm:w-auto"
                >
                  <Phone className="w-5 h-5" />
                  {settings.cta_primary}
                </Button>
              </a>
              <Link href="/cardapio">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-foreground/30 bg-[#1A1A1A] text-foreground hover:bg-[#2A2A2A] font-bold text-sm px-8 py-6 rounded-lg w-full sm:w-auto"
                >
                  {settings.cta_secondary}
                </Button>
              </Link>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-sm">ENTREGA RAPIDA</p>
                  <p className="text-foreground/50 text-xs">Rapido e seguro</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                  <Fish className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-sm">PEIXES FRESCOS</p>
                  <p className="text-foreground/50 text-xs">Selecionados diariamente</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-sm">QUALIDADE PREMIUM</p>
                  <p className="text-foreground/50 text-xs">O melhor sushi da cidade</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              currentSlide === index ? 'bg-foreground' : 'bg-foreground/30'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
