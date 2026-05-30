"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Moon, Sun, ShoppingCart, UtensilsCrossed, Home } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCart } from '@/contexts/cart-context'
import { useEffect, useState } from 'react'

export function MobileBottomNav() {
  const { theme, setTheme } = useTheme()
  const { totalPrice, totalItems, setIsOpen } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalPrice)

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-safe"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {/* Home */}
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors min-w-[60px]"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Início</span>
        </Link>

        {/* Cardápio */}
        <Link
          href="/cardapio"
          className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors min-w-[60px]"
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cardápio</span>
        </Link>

        {/* Carrinho - Botão Central Destacado */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative -mt-6 flex flex-col items-center"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-background"
          >
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          {totalItems > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
            >
              {totalItems}
            </motion.span>
          )}
          <span className="text-[10px] font-medium text-primary mt-1">
            {totalPrice > 0 ? formattedTotal : 'Carrinho'}
          </span>
        </button>

        {/* Tema */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors min-w-[60px]"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          <span className="text-[10px] font-medium">
            {theme === 'dark' ? 'Claro' : 'Escuro'}
          </span>
        </button>

        {/* Perfil */}
        <Link
          href="/perfil"
          className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors min-w-[60px]"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>
    </motion.nav>
  )
}
