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
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Mobile Header - Estilo da loja */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-700 dark:text-white h-10 w-10"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          {/* Logo central */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Acai da Praia</span>
          </Link>
          
          {/* Botao voltar para loja */}
          <Link href="/cardapio">
            <Button variant="ghost" size="icon" className="text-violet-600 dark:text-violet-400 h-10 w-10">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        {/* Titulo da pagina atual */}
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Minha Conta</p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            {menuItems.find(item => pathname === item.href || pathname?.startsWith(item.href + '/'))?.label || 'Perfil'}
          </h1>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar Desktop */}
        <aside className={`
          fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-40
          w-[280px] bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo/Header - Estilo da loja */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Acai da Praia</h1>
                <p className="text-violet-600 dark:text-violet-400 text-xs font-medium">Minha Conta</p>
              </div>
            </Link>
            
            {/* Botao voltar para cardapio */}
            <Link href="/cardapio" className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
              <Home className="w-4 h-4" />
              <span>Voltar para o cardapio</span>
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
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-white/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-violet-500 group-hover:bg-violet-50 dark:group-hover:bg-violet-500/10'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isActive ? '' : 'text-slate-700 dark:text-slate-300'}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={`
                    w-4 h-4 flex-shrink-0 transition-transform
                    ${isActive ? 'text-white/70' : 'text-slate-300 dark:text-slate-600 group-hover:text-violet-500'}
                  `} />
                </Link>
              )
            })}
          </nav>

          {/* Footer com acoes */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {/* Fazer novo pedido */}
            <Link href="/cardapio">
              <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Fazer Pedido
              </Button>
            </Link>
            
            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sair da Conta</span>
            </Button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full">
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pt-28 lg:pt-6 pb-24 lg:pb-8">
            {children}
          </div>
          
          {/* Mobile Bottom Navigation - Estilo loja */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 z-40">
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
