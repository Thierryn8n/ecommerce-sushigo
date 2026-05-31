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
  Sparkles
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Bem-vindo à sua área exclusiva</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-violet-100 to-purple-50 dark:from-violet-500/20 dark:to-purple-500/10 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Cliente VIP</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
              {activeOrders.length} ativos
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{orders.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total de Pedidos</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            R$ {totalSpent.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total em Compras</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{addresses.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Endereços</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">Fidelidade</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Programa VIP</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all group"
                >
                  <div className={`p-3 rounded-lg ${link.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 dark:text-white font-medium">{link.label}</p>
                      {link.count > 0 && (
                        <span className="bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {link.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{link.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Pedidos Recentes</h2>
            <Link href="/perfil/historico" className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-violet-600 dark:text-violet-400 font-semibold">
                    R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'entregue' ? 'bg-green-500/20 text-green-500' :
                    order.status === 'cancelado' ? 'bg-red-500/20 text-red-500' :
                    'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400'
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
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-transparent border border-violet-200 dark:border-violet-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-medium">Endereço Principal</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {defaultAddress.street}, {defaultAddress.number}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {defaultAddress.neighborhood}, {defaultAddress.city}
                </p>
              </div>
            </div>
            <Link href="/perfil/enderecos">
              <Button variant="outline" size="sm" className="border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10">
                Gerenciar
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Security Link */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <Link href="/perfil/conta" className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-slate-900 dark:text-white font-medium">Segurança da Conta</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Altere sua senha e dados de login</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
