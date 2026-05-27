'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface DashboardStats {
  vendasHoje: number
  pedidosHoje: number
  ticketMedio: number
  clientesNovos: number
  vendasOntem: number
  pedidosOntem: number
}

interface RecentOrder {
  id: string
  customer_name: string
  total: number
  status: string
  created_at: string
  items_count: number
  payment_status: string
}

interface TopProduct {
  name: string
  total_sales: number
  total_revenue: number
}

interface QuickStats {
  pending: number
  preparing: number
  delivered: number
  cancelled: number
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Pendente' },
  preparing: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Preparando' },
  ready: { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Pronto' },
  out_for_delivery: { bg: 'bg-orange-500/10', text: 'text-orange-600', label: 'Saiu p/ Entrega' },
  delivered: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Entregue' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Cancelado' },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        // Vendas e pedidos de hoje
        const { data: todayOrders } = await supabase
          .from('orders')
          .select('total, created_at')
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
          .neq('status', 'cancelled')

        // Vendas e pedidos de ontem
        const { data: yesterdayOrders } = await supabase
          .from('orders')
          .select('total')
          .gte('created_at', `${yesterday}T00:00:00`)
          .lte('created_at', `${yesterday}T23:59:59`)
          .neq('status', 'cancelled')

        // Clientes novos (usuários criados hoje)
        const { data: newUsers } = await supabase
          .from('profiles')
          .select('id')
          .gte('created_at', `${today}T00:00:00`)

        // Pedidos recentes
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select('id, customer_name, total, status, created_at, items, payment_status')
          .order('created_at', { ascending: false })
          .limit(5)

        // Produtos mais vendidos (simplificado)
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_name, quantity, price')
          .limit(100)

        // Quick stats por status
        const { data: statusCounts } = await supabase
          .from('orders')
          .select('status')

        const vendasHoje = todayOrders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0
        const pedidosHoje = todayOrders?.length || 0
        const vendasOntem = yesterdayOrders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0
        const pedidosOntem = yesterdayOrders?.length || 0
        const ticketMedio = pedidosHoje > 0 ? vendasHoje / pedidosHoje : 0

        // Processar top produtos
        const productMap = new Map<string, { sales: number; revenue: number }>()
        orderItems?.forEach(item => {
          const existing = productMap.get(item.product_name) || { sales: 0, revenue: 0 }
          existing.sales += item.quantity
          existing.revenue += item.quantity * item.price
          productMap.set(item.product_name, existing)
        })
        
        const topProductsArray = Array.from(productMap.entries())
          .map(([name, data]) => ({ name, total_sales: data.sales, total_revenue: data.revenue }))
          .sort((a, b) => b.total_sales - a.total_sales)
          .slice(0, 5)

        // Processar status counts
        const statusCount = statusCounts?.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        setStats({
          vendasHoje,
          pedidosHoje,
          ticketMedio,
          clientesNovos: newUsers?.length || 0,
          vendasOntem,
          pedidosOntem,
        })

        setRecentOrders(recentOrdersData?.map(o => ({
          id: o.id,
          customer_name: o.customer_name,
          total: o.total,
          status: o.status,
          created_at: o.created_at,
          items_count: o.items?.length || 0,
          payment_status: o.payment_status
        })) || [])

        setTopProducts(topProductsArray)
        setQuickStats({
          pending: statusCount['pending'] || 0,
          preparing: statusCount['preparing'] || 0,
          delivered: statusCount['delivered'] || 0,
          cancelled: statusCount['cancelled'] || 0,
        })
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  const statCards = stats ? [
    { label: 'Vendas Hoje', value: formatCurrency(stats.vendasHoje), change: `${stats.vendasOntem > 0 ? ((stats.vendasHoje - stats.vendasOntem) / stats.vendasOntem * 100).toFixed(0) : 0}%`, icon: DollarSign },
    { label: 'Pedidos Hoje', value: stats.pedidosHoje.toString(), change: `${stats.pedidosOntem > 0 ? ((stats.pedidosHoje - stats.pedidosOntem) / stats.pedidosOntem * 100).toFixed(0) : 0}%`, icon: ShoppingCart },
    { label: 'Ticket Médio', value: formatCurrency(stats.ticketMedio), change: '+0%', icon: TrendingUp },
    { label: 'Clientes Novos', value: stats.clientesNovos.toString(), change: 'Hoje', icon: Users },
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:ml-56">
          <AdminHeader />
          <main className="p-6 flex items-center justify-center h-[calc(100vh-4rem)]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:ml-56">
        <AdminHeader />
        
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">{stat.change}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-foreground text-2xl font-bold">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-foreground">Pedidos Recentes</h2>
                  <Link href="/admin/pedidos" className="text-primary text-sm hover:underline">
                    Ver todos
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-muted-foreground text-sm">
                        <th className="text-left pb-4">Pedido</th>
                        <th className="text-left pb-4">Cliente</th>
                        <th className="text-left pb-4 hidden sm:table-cell">Total</th>
                        <th className="text-left pb-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length > 0 ? recentOrders.map((order) => {
                        const status = statusStyles[order.status] || statusStyles['pending']
                        return (
                          <tr key={order.id} className="border-t border-border">
                            <td className="py-4">
                              <Link href={`/admin/pedidos/${order.id}`} className="text-foreground font-medium hover:text-primary">
                                #{order.id.slice(-6)}
                              </Link>
                              <p className="text-muted-foreground text-xs">
                                {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </td>
                            <td className="py-4 text-foreground/80">{order.customer_name}</td>
                            <td className="py-4 text-foreground font-medium hidden sm:table-cell">{formatCurrency(order.total)}</td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            Nenhum pedido encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-bold text-foreground mb-6">Mais Vendidos</h2>
                <div className="space-y-4">
                  {topProducts.length > 0 ? topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">{product.name}</p>
                        <p className="text-muted-foreground text-sm">{product.total_sales} vendas</p>
                      </div>
                      <p className="text-primary font-semibold">{formatCurrency(product.total_revenue)}</p>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">Nenhum dado disponível</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {quickStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <Link href="/admin/pedidos/kanban">
                  <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 hover:border-yellow-500/50 transition-colors">
                    <Clock className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{quickStats.pending}</p>
                      <p className="text-muted-foreground text-xs">Pendentes</p>
                    </div>
                  </div>
                </Link>
                <Link href="/admin/pedidos/kanban">
                  <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 hover:border-blue-500/50 transition-colors">
                    <Package className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{quickStats.preparing}</p>
                      <p className="text-muted-foreground text-xs">Preparando</p>
                    </div>
                  </div>
                </Link>
                <Link href="/admin/pedidos/kanban">
                  <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 hover:border-green-500/50 transition-colors">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{quickStats.delivered}</p>
                      <p className="text-muted-foreground text-xs">Entregues (Hoje)</p>
                    </div>
                  </div>
                </Link>
                <Link href="/admin/pedidos/kanban">
                  <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 hover:border-red-500/50 transition-colors">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{quickStats.cancelled}</p>
                      <p className="text-muted-foreground text-xs">Cancelados</p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
