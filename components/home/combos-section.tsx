"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface AppSettings {
  [key: string]: string
}

export function CombosSection() {
  const [settings, setSettings] = useState<AppSettings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

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
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="animate-pulse h-64 bg-muted rounded-3xl"></div>
            <div className="animate-pulse h-64 bg-muted rounded-3xl"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Combos Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8"
          >
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black text-primary-foreground mb-2">
                {settings.combos_title?.split(' ')[0] || 'COMBOS'}
              </h3>
              <p className="text-2xl md:text-3xl font-black text-secondary mb-4">
                {settings.combos_title?.split(' ').slice(1).join(' ') || 'ESPECIAIS'}
              </p>
              <p className="text-primary-foreground/80 mb-6">
                {settings.combos_description || 'Mais sabor por um preco incrivel!'}
              </p>
              <Link href="/combos">
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-6 py-3 rounded-full">
                  VER COMBOS
                </Button>
              </Link>
            </div>
            {/* Decorative Image */}
            <div className="absolute right-0 bottom-0 w-40 h-40 opacity-80">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png"
                alt="Combo"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* App Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary to-secondary/80 p-8"
          >
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-black text-secondary-foreground mb-4">
                {settings.app_title || 'BAIXE NOSSO APP'}
              </h3>
              <p className="text-secondary-foreground/80 mb-6">
                {settings.app_description || 'Mais praticidade, promocoes exclusivas e muito mais!'}
              </p>
              <div className="flex gap-3">
                <Link href={settings.app_store_url || '#'} target="_blank">
                  <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black/80 transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[8px] leading-none">Baixar na</p>
                      <p className="text-sm font-semibold">App Store</p>
                    </div>
                  </button>
                </Link>
                <Link href={settings.play_store_url || '#'} target="_blank">
                  <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black/80 transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[8px] leading-none">Disponivel no</p>
                      <p className="text-sm font-semibold">Google Play</p>
                    </div>
                  </button>
                </Link>
              </div>
            </div>
            {/* Phone Mockup */}
            <div className="absolute right-4 -bottom-4 w-32 h-48 opacity-90">
              <div className="w-full h-full bg-background rounded-2xl border-4 border-background/50 flex items-center justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png"
                  alt="App"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
