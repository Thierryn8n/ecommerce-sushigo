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
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
    label: 'Histórico de Compras', 
    icon: History,
    description: 'Todas as suas compras'
  },
  { 
    href: '/perfil/enderecos', 
    label: 'Meus Endereços', 
    icon: MapPin,
    description: 'Cadastrar e gerenciar'
  },
  { 
    href: '/perfil/conta', 
    label: 'Segurança', 
    icon: Shield,
    description: 'Senha e login'
  },
  { 
    href: '/perfil/carrinho-abandonado', 
    label: 'Carrinhos Salvos', 
    icon: ShoppingCart,
    description: 'Itens não finalizados'
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8C00]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white shadow-lg hover:bg-slate-50"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {(isMobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={`
                fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-40
                w-[280px] bg-white dark:bg-slate-900
                border-r border-slate-200 dark:border-slate-800
                flex flex-col shadow-xl lg:shadow-none
                ${isMobileMenuOpen ? 'block' : 'hidden lg:flex'}
              `}
            >
              {/* Logo/Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Minha Conta</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Área do Cliente</p>
                  </div>
                </Link>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                        ${isActive 
                          ? 'bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                        }
                      `}
                    >
                      <div className={`
                        p-2 rounded-lg transition-colors
                        ${isActive ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-violet-500'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-400">{item.description}</p>
                      </div>
                      <ChevronRight className={`
                        w-4 h-4 transition-transform
                        ${isActive ? 'text-violet-500 translate-x-0' : 'text-slate-300 dark:text-slate-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}
                      `} />
                    </Link>
                  )
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start gap-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sair da Conta</span>
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
