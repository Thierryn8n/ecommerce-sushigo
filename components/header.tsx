"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import { useStore } from '@/lib/store-context'

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/cardapio', label: 'Cardápio' },
  { href: '/combos', label: 'Combos' },
  { href: '/promocoes', label: 'Promoções' },
  { href: '/sobre-nos', label: 'Sobre Nós' },
  { href: '/contato', label: 'Contato' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { totalItems, setIsOpen } = useCart()
  const router = useRouter()
  const supabase = createClient()
  const { store, loading: storeLoading } = useStore()

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="relative z-10">
            {storeLoading ? (
              <div className="w-16 h-16 rounded-lg bg-muted animate-pulse" />
            ) : store?.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                {store?.name?.charAt(0) || 'A'}
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/90 hover:text-primary transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!loading && !user ? (
              <Link href="/login" className="hidden md:flex">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-muted">
                  <User className="w-5 h-5 mr-2" />
                  Entrar
                </Button>
              </Link>
            ) : !loading && user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/perfil">
                  <Button variant="ghost" size="sm" className="text-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-muted">
                    <User className="w-5 h-5 mr-2" />
                    Perfil
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : null}
            
            {/* Botão do Carrinho - Versão Light/Dark */}
            <Button
              onClick={() => setIsOpen(true)}
              className="relative bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-full transition-all hover:scale-105 dark:bg-secondary dark:hover:bg-secondary/90 shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Meu Pedido</span>
              <span className="sm:hidden">Pedido</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse shadow-md">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-foreground p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Theme Aware */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 dark:bg-[#1a0a25]/95 backdrop-blur-lg border-t border-border shadow-lg"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground hover:text-primary hover:bg-primary/5 dark:hover:bg-white/5 transition-colors font-medium py-3 px-3 rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-2"></div>
              {!loading && !user ? (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground hover:text-primary hover:bg-primary/5 dark:hover:bg-white/5 transition-colors font-medium py-3 px-3 rounded-lg flex items-center"
                >
                  <User className="w-5 h-5 mr-2" />
                  Entrar / Cadastrar
                </Link>
              ) : !loading && user ? (
                <>
                  <Link
                    href="/perfil"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-foreground hover:text-primary hover:bg-primary/5 dark:hover:bg-white/5 transition-colors font-medium py-3 px-3 rounded-lg flex items-center"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Meu Perfil
                  </Link>
                  <Link
                    href="/meus-pedidos"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-foreground hover:text-primary hover:bg-primary/5 dark:hover:bg-white/5 transition-colors font-medium py-3 px-3 rounded-lg flex items-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Meus Pedidos
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                    }}
                    className="text-foreground hover:text-destructive hover:bg-destructive/5 transition-colors font-medium py-3 px-3 rounded-lg flex items-center text-left w-full"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sair
                  </button>
                </>
              ) : null}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
