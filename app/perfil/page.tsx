'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  MapPin, 
  Package, 
  History, 
  ShoppingCart,
  Shield,
  Edit2,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Sparkles,
  UtensilsCrossed,
  Gift
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Profile {
  id: string
  full_name: string
  phone: string
  cpf: string
  avatar_url?: string
}

interface Address {
  id: string
  label: string
  street: string
  number: string
  neighborhood: string
  city: string
  is_default: boolean
}

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Fetch addresses
      const { data: addressesData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setProfile(profileData)
      setAddresses(addressesData || [])
      setOrders(ordersData || [])
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8C00]"></div>
      </div>
    )
  }

  const defaultAddress = addresses.find(a => a.is_default) || addresses[0]
  const activeOrders = orders.filter(o => !['entregue', 'cancelado'].includes(o.status))
  const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

  const quickLinks = [
    { 
      href: '/perfil/rastreio', 
      label: 'Rastrear Pedidos', 
      icon: Package,
      color: 'bg-blue-500/20 text-blue-500',
      count: activeOrders.length,
      description: activeOrders.length > 0 ? `${activeOrders.length} em andamento` : 'Nenhum pedido ativo'
    },
    { 
      href: '/perfil/historico', 
      label: 'Histórico', 
      icon: History,
      color: 'bg-green-500/20 text-green-500',
      count: orders.length,
      description: `${orders.length} pedidos realizados`
    },
    { 
      href: '/perfil/enderecos', 
      label: 'Endereços', 
      icon: MapPin,
      color: 'bg-[#FF8C00]/20 text-violet-600 dark:text-violet-400',
      count: addresses.length,
      description: `${addresses.length} cadastrados`
    },
    { 
      href: '/perfil/carrinho-abandonado', 
      label: 'Carrinhos', 
      icon: ShoppingCart,
      color: 'bg-purple-500/20 text-purple-500',
      count: 0,
      description: 'Itens salvos'
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Promo Banner - Estilo Loja */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 rounded-2xl p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-10" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs sm:text-sm">Cliente desde {new Date().getFullYear()}</p>
              <h2 className="text-white font-bold text-lg sm:text-xl">Ganhe 10% no proximo pedido!</h2>
            </div>
          </div>
          <Link href="/cardapio">
            <Button className="bg-white text-violet-600 hover:bg-white/90 font-semibold shadow-lg w-full sm:w-auto">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Pedir Agora
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Welcome Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            Ola, {profile?.full_name?.split(' ')[0] || 'Cliente'}!
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">Bem-vindo a sua area exclusiva</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-violet-100 to-purple-50 border border-violet-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-xs sm:text-sm font-medium text-violet-700">Cliente VIP</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
            <span className="text-[10px] sm:text-xs text-green-500 bg-green-500/10 px-1.5 sm:px-2 py-0.5 rounded-full">
              {activeOrders.length} ativos
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{orders.length}</p>
          <p className="text-[10px] sm:text-xs text-slate-500">Pedidos</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">
            R$ {totalSpent.toFixed(0)}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500">Total</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{addresses.length}</p>
          <p className="text-[10px] sm:text-xs text-slate-500">Enderecos</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900">VIP</p>
          <p className="text-[10px] sm:text-xs text-slate-500">Fidelidade</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Acesso Rapido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link, index) => {
            const Icon = link.icon
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 transition-all group"
                >
                  <div className={`p-2 sm:p-3 rounded-lg ${link.color}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 font-medium text-sm sm:text-base truncate">{link.label}</p>
                      {link.count > 0 && (
                        <span className="bg-violet-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                          {link.count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{link.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Pedidos Recentes</h2>
            <Link href="/perfil/historico" className="text-sm text-violet-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-violet-600 font-semibold">
                    R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'entregue' ? 'bg-green-500/20 text-green-500' :
                    order.status === 'cancelado' ? 'bg-red-500/20 text-red-500' :
                    'bg-violet-100 text-violet-700 dark:text-violet-400'
                  }`}>
                    {order.status === 'entregue' ? 'Entregue' :
                     order.status === 'cancelado' ? 'Cancelado' : 'Em andamento'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Address */}
      {defaultAddress && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <MapPin className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-slate-900 font-medium">Endereço Principal</p>
                <p className="text-sm text-slate-500">
                  {defaultAddress.street}, {defaultAddress.number}
                </p>
                <p className="text-xs text-slate-500">
                  {defaultAddress.neighborhood}, {defaultAddress.city}
                </p>
              </div>
            </div>
            <Link href="/perfil/enderecos">
              <Button variant="outline" size="sm" className="border-violet-200 text-violet-600 hover:bg-violet-50">
                Gerenciar
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Security Link */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <Link href="/perfil/conta" className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-slate-900 font-medium">Segurança da Conta</p>
              <p className="text-sm text-slate-500">Altere sua senha e dados de login</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
