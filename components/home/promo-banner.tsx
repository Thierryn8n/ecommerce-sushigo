"use client"

import { motion } from 'framer-motion'
import { Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function PromoBanner() {
  return (
    <section className="py-8 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-primary rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Percent className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-primary-foreground font-bold text-xl md:text-2xl">PROMOCOES EXCLUSIVAS</h3>
              <p className="text-primary-foreground/80 text-sm md:text-base">
                Ofertas especiais toda semana para voce aproveitar!
              </p>
            </div>
          </div>
          <Link href="/promocoes">
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold px-8 py-6 rounded-lg">
              VER PROMOCOES
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
