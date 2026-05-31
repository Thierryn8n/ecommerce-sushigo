'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Illustration */}
          <div className="relative mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="relative w-48 h-48 mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#D62828]/20 to-[#FFC300]/20 rounded-full blur-2xl" />
              <div className="relative w-full h-full flex items-center justify-center">
                <span className="text-8xl font-bold text-[#D62828]">404</span>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="bg-card rounded-3xl p-8 border border-border">
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Pagina nao encontrada
            </h1>
            <p className="text-muted-foreground mb-6">
              Ops! Parece que voce se perdeu. A pagina que voce esta procurando nao existe ou foi movida.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="w-full sm:w-auto bg-[#D62828] hover:bg-[#FFC300] text-white font-semibold px-6">
                  <Home className="w-4 h-4 mr-2" />
                  Pagina Inicial
                </Button>
              </Link>
              <Link href="/cardapio">
                <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-muted font-semibold px-6">
                  <Search className="w-4 h-4 mr-2" />
                  Ver Cardapio
                </Button>
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-sm text-muted-foreground">
            Precisa de ajuda?{' '}
            <Link href="/contato" className="text-[#D62828] hover:text-[#FFC300] transition-colors">
              Fale conosco
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
