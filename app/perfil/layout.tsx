'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  User, 
  MapPin, 
  Package, 
  History, 
  ShoppingCart, 
  Shield, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  UtensilsCrossed
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/header'

const menuItems = [
  { 
    href: '/perfil', 
    label: 'Meu Perfil', 
    icon: User,
    description: 'Dados pessoais'
  },
  { 
    href: '/perfil/rastreio', 
    label: 'Rastrear Pedidos', 
    icon: Package,
    description: 'Acompanhe seus pedidos'
  },
  { 
    href: '/perfil/historico', 
    label: 'Historico', 
    icon: History,
    description: 'Todas as suas compras'
  },
  { 
    href: '/perfil/enderecos', 
    label: 'Enderecos', 
    icon: MapPin,
    description: 'Cadastrar e gerenciar'
  },
  { 
    href: '/perfil/conta', 
    label: 'Seguranca', 
    icon: Shield,
    description: 'Senha e login'
  },
  { 
    href: '/perfil/carrinho-abandonado', 
    label: 'Carrinhos', 
    icon: ShoppingCart,
    description: 'Itens salvos'
  },
]

export default function PerfilLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header da Loja */}
      <Header />

      <div className="flex flex-1 pt-20 lg:pt-0">
        {/* Sidebar Desktop + Mobile Menu */}
        <AnimatePresence>
          <motion.div
            initial={false}
            animate={isMobileMenuOpen ? { x: 0 } : { x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed lg:static top-20 lg:top-0 left-0 z-40 lg:z-0 w-72 h-[calc(100vh-80px)] lg:h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto lg:overflow-auto
              ${isMobileMenuOpen ? 'shadow-2xl' : ''}
            `}
          >
            <div className="p-4 lg:p-6 space-y-2">
              {/* Header da barra lateral */}
              <div className="hidden lg:block mb-6">
                <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Menu</h2>
              </div>

              {/* Menu Items */}
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item.description}
                      </p>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                  </Link>
                )
              })}

              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-800 my-4" />

              {/* CTA Button */}
              <Link href="/cardapio" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Fazer Novo Pedido
                </Button>
              </Link>

              {/* Logout Button */}
              <Button 
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-slate-700 dark:text-white"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Minha Conta</h1>
                <div className="w-10" />
              </div>
            </div>

            <div className="lg:hidden pt-16">
              {children}
            </div>

            <div className="hidden lg:block">
              {children}
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="flex items-center justify-around">
              <Link href="/" className="flex flex-col items-center gap-1 p-2 text-slate-600 dark:text-slate-400 hover:text-violet-600">
                <Home className="w-5 h-5" />
                <span className="text-xs font-medium">Loja</span>
              </Link>
              <Link href="/cardapio" className="flex flex-col items-center gap-1 p-2 text-slate-600 dark:text-slate-400 hover:text-violet-600">
                <UtensilsCrossed className="w-5 h-5" />
                <span className="text-xs font-medium">Pedir</span>
              </Link>
              <Link href="/perfil/rastreio" className="flex flex-col items-center gap-1 p-2 text-slate-600 dark:text-slate-400 hover:text-violet-600">
                <Package className="w-5 h-5" />
                <span className="text-xs font-medium">Pedidos</span>
              </Link>
              <Link href="/perfil" className="flex flex-col items-center gap-1 p-2 text-slate-600 dark:text-slate-400 hover:text-violet-600">
                <User className="w-5 h-5" />
                <span className="text-xs font-medium">Perfil</span>
              </Link>
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="icon"
                className="flex flex-col items-center gap-1 h-auto py-2 text-slate-600 dark:text-slate-400 hover:text-violet-600"
              >
                <Menu className="w-5 h-5" />
                <span className="text-xs font-medium">Menu</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
