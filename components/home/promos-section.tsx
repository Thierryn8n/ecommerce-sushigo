"use client"

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Percent } from 'lucide-react'

export function PromosSection() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 md:gap-12">
          <Percent className="w-16 h-16 md:w-20 md:h-20 text-white flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">PROMOÇÕES EXCLUSIVAS</h2>
            <p className="text-white/90 md:text-lg">Ofertas especiais toda a semana para você aproveitar!</p>
          </div>
          <Link href="/promotions">
            <Button className="bg-white text-primary hover:bg-white/90 font-black px-8 h-12 whitespace-nowrap">
              VER PROMOÇÕES
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
