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
    title_line2: 'ONDE VOCÊ ESTIVER.',
    subtitle: 'Peixes selecionados, ingredientes frescos',
    description: 'e o verdadeiro sabor da culinária japonesa na sua casa.',
    cta_primary: 'PEDIR AGORA',
    cta_secondary: 'VER CARDÁPIO',
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
            {/* Title - Design exato da imagem */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="text-[#D62828]">{settings.title_line1.split(',')[0]}</span>
              <span className="text-white">,</span>
              <br />
              <span className="text-[#D62828]">{settings.title_line2.split(' ')[0]}</span>
              <span className="text-white"> {settings.title_line2.split(' ').slice(1).join(' ')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed max-w-md">
              {settings.subtitle}
              <br />
              {settings.description}
            </p>

            {/* CTA Buttons - Estilo exato das imagens */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/checkout">
                <Button 
                  size="lg" 
                  className="bg-[#D62828] hover:bg-[#D62828]/90 text-white font-bold text-sm px-8 py-6 rounded-md gap-2 w-full sm:w-auto"
                >
                  <Phone className="w-5 h-5" />
                  {settings.cta_primary}
                </Button>
              </Link>
              <Link href="/cardapio">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border border-white/30 bg-[#1A1A1A]/80 text-white hover:bg-[#1A1A1A] font-bold text-sm px-8 py-6 rounded-md w-full sm:w-auto"
                >
                  {settings.cta_secondary}
                </Button>
              </Link>
            </div>

            {/* Benefits - Texto exato das imagens */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#D62828]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">ENTREGA RÁPIDA</p>
                  <p className="text-white/60 text-xs">Até 60 minutos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                  <Fish className="w-5 h-5 text-[#D62828]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">PEIXES SELECIONADOS</p>
                  <p className="text-white/60 text-xs">Qualidade premium</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#D62828]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">EMBALAGEM PREMIUM</p>
                  <p className="text-white/60 text-xs">Segurança e qualidade</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  )
}
