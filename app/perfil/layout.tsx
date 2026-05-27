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
import { useStore } from '@/lib/store-context'

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
  const { store } = useStore()
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
            {store?.logo_url ? (
              <Image src={store.logo_url} alt="Logo" width={64} height={64} className="object-contain rounded-2xl" />
            ) : (
              <UtensilsCrossed className="w-8 h-8 text-white" />
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-slate-50 dark:from-slate-950 dark:to-slate-900">

      {/* Mobile sub-header com titulo da pagina */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-700 dark:text-white h-10 w-10"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            {store?.logo_url ? (
              <Image src={store.logo_url} alt={store.name || 'Logo'} width={36} height={36} className="object-contain" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-bold text-slate-900 dark:text-white text-base">{store?.name || 'Loja'}</span>
          </Link>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar Desktop */}
        <aside className={`
          fixed top-0 h-screen inset-y-0 left-0 z-40
          w-[280px] bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col shadow-xl lg:shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo/Header - busca do Supabase igual ao header principal */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-violet-500/10 to-purple-500/5 dark:from-violet-500/20 dark:to-purple-500/10">
            <Link href="/" className="flex items-center gap-3 group">
              {store?.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name || 'Logo'}
                  width={56}
                  height={56}
                  priority
                  className="object-contain rounded-2xl group-hover:scale-105 transition-transform drop-shadow-sm"
                  style={{ width: 56, height: 'auto' }}
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-7 h-7 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-slate-900 dark:text-white font-bold text-lg tracking-tight leading-tight">{store?.name || 'Loja'}</h1>
                <p className="text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wide">Minha Conta</p>
              </div>
            </Link>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/perfil' && pathname?.startsWith(item.href))
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' 
                      : 'hover:bg-violet-50 dark:hover:bg-violet-500/10'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-white/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-violet-500 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={`
                    w-4 h-4 flex-shrink-0 transition-transform
                    ${isActive ? 'text-white/70' : 'text-slate-300 group-hover:text-violet-500'}
                  `} />
                </Link>
              )
            })}
          </nav>

          {/* Footer com acoes */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <Link href="/cardapio">
              <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Fazer Pedido
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sair da Conta</span>
            </Button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 w-full lg:ml-[280px]">
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pt-20 lg:pt-8 pb-24 lg:pb-8">
            {children}
          </div>
          
          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-around">
              <Link href="/cardapio" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-violet-600 transition-colors">
                <Home className="w-5 h-5" />
                <span className="text-[10px]">Cardapio</span>
              </Link>
              <Link href="/perfil/rastreio" className={`flex flex-col items-center gap-1 p-2 transition-colors ${pathname === '/perfil/rastreio' ? 'text-violet-600' : 'text-slate-500 hover:text-violet-600'}`}>
                <Package className="w-5 h-5" />
                <span className="text-[10px]">Pedidos</span>
              </Link>
              <Link href="/carrinho" className="flex flex-col items-center gap-1 p-2">
                <div className="w-12 h-12 -mt-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-violet-600 font-medium">Carrinho</span>
              </Link>
              <Link href="/perfil/historico" className={`flex flex-col items-center gap-1 p-2 transition-colors ${pathname === '/perfil/historico' ? 'text-violet-600' : 'text-slate-500 hover:text-violet-600'}`}>
                <History className="w-5 h-5" />
                <span className="text-[10px]">Historico</span>
              </Link>
              <Link href="/perfil" className={`flex flex-col items-center gap-1 p-2 transition-colors ${pathname === '/perfil' ? 'text-violet-600' : 'text-slate-500 hover:text-violet-600'}`}>
                <User className="w-5 h-5" />
                <span className="text-[10px]">Perfil</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
