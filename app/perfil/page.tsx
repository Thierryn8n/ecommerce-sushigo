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
  ChevronRight,
  Star,
  TrendingUp,
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: addressesData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
      label: 'Historico', 
      icon: History,
      color: 'bg-green-500/20 text-green-500',
      count: orders.length,
      description: `${orders.length} pedidos realizados`
    },
    { 
      href: '/perfil/enderecos', 
      label: 'Enderecos', 
      icon: MapPin,
      color: 'bg-primary/20 text-primary',
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
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Ola, {profile?.full_name?.split(' ')[0] || 'Cliente'}!
          </h1>
          <p className="text-muted-foreground">Bem-vindo a sua area exclusiva</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-accent/20 border border-accent/30 rounded-xl px-4 py-2 flex items-center gap-2">
            <Gift className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Cliente VIP</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
              {activeOrders.length} ativos
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Total de Pedidos</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            R$ {totalSpent.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-muted-foreground">Total em Compras</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{addresses.length}</p>
          <p className="text-xs text-muted-foreground">Enderecos</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">350</p>
          <p className="text-xs text-muted-foreground">Pontos SushiGo</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Acesso Rapido</h2>
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
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                >
                  <div className={`p-3 rounded-lg ${link.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-medium">{link.label}</p>
                      {link.count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {link.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
            <h2 className="text-lg font-semibold text-foreground">Pedidos Recentes</h2>
            <Link href="/perfil/historico" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold">
                    R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'entregue' ? 'bg-green-500/20 text-green-500' :
                    order.status === 'cancelado' ? 'bg-red-500/20 text-red-500' :
                    'bg-primary/20 text-primary'
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
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium">Endereco Principal</p>
                <p className="text-sm text-muted-foreground">
                  {defaultAddress.street}, {defaultAddress.number}
                </p>
                <p className="text-xs text-muted-foreground">
                  {defaultAddress.neighborhood}, {defaultAddress.city}
                </p>
              </div>
            </div>
            <Link href="/perfil/enderecos">
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                Gerenciar
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Security Link */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <Link href="/perfil/conta" className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-foreground font-medium">Seguranca da Conta</p>
              <p className="text-sm text-muted-foreground">Altere sua senha e dados de login</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
