"use client"

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Percent } from 'lucide-react'
import { motion } from 'framer-motion'

export function PromosSection() {
  return (
    <section className="py-6 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-primary rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Icon */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Percent className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            
            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-black text-white mb-1">PROMOCOES EXCLUSIVAS</h2>
              <p className="text-white/80 text-sm md:text-base">
                Ofertas especiais toda semana<br className="hidden md:block" />
                para voce aproveitar!
              </p>
            </div>
            
            {/* Button */}
            <Link href="/promocoes">
              <Button className="bg-white text-primary hover:bg-white/90 font-black px-8 h-12 text-sm whitespace-nowrap rounded-lg">
                VER PROMOCOES
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
