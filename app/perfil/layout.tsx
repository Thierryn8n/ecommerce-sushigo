'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
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
  Home,
  UtensilsCrossed
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { href: '/perfil', label: 'Meu Perfil', icon: User, description: 'Dados pessoais' },
  { href: '/perfil/rastreio', label: 'Rastrear Pedidos', icon: Package, description: 'Acompanhe seus pedidos' },
  { href: '/perfil/historico', label: 'Historico', icon: History, description: 'Todas as suas compras' },
  { href: '/perfil/enderecos', label: 'Enderecos', icon: MapPin, description: 'Cadastrar e gerenciar' },
  { href: '/perfil/conta', label: 'Seguranca', icon: Shield, description: 'Senha e login' },
  { href: '/perfil/carrinho-abandonado', label: 'Carrinhos', icon: ShoppingCart, description: 'Itens salvos' },
]

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex pt-20">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 fixed left-0 top-20 bottom-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Sair</span>
            </button>
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween' }}
                className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Menu</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                  </button>
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-6">
          <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2 z-40">
        <div className="flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 p-2 text-slate-500 hover:text-violet-600">
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Loja</span>
          </Link>
          <Link href="/cardapio" className="flex flex-col items-center gap-0.5 p-2 text-slate-500 hover:text-violet-600">
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-[10px]">Cardapio</span>
          </Link>
          <Link href="/perfil/rastreio" className="flex flex-col items-center gap-0.5 p-2 text-slate-500 hover:text-violet-600">
            <Package className="w-5 h-5" />
            <span className="text-[10px]">Pedidos</span>
          </Link>
          <Link href="/perfil" className={`flex flex-col items-center gap-0.5 p-2 ${pathname === '/perfil' ? 'text-violet-600' : 'text-slate-500 hover:text-violet-600'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px]">Perfil</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 p-2 text-slate-500 hover:text-violet-600"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </div>
      </div>
    </div>
  )
}
