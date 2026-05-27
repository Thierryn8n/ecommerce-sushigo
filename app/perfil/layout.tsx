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
    <div className="min-h-screen bg-background">
      {/* Header da Loja */}
      <Header />

      <div className="flex">
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
