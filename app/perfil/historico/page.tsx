'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  History, 
  Package, 
  Calendar,
  TrendingUp,
  ShoppingBag,
  Star,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  product_image?: string
  toppings?: { name: string; image?: string }[]
  sauces?: { name: string; image?: string }[]
  bowl_type?: string
  bowl_image?: string
  size?: string
}

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  delivery_address: string
  payment_method: string
  order_items: OrderItem[]
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pedido_feito: { label: 'Recebido', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  confirmado: { label: 'Confirmado', color: 'text-green-500', bgColor: 'bg-green-500/20' },
  preparando: { label: 'Em Preparo', color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  em_preparo: { label: 'Em Preparo', color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  saiu_entrega: { label: 'Em Entrega', color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
  entregue: { label: 'Entregue', color: 'text-green-500', bgColor: 'bg-green-500/20' },
  cancelado: { label: 'Cancelado', color: 'text-red-500', bgColor: 'bg-red-500/20' }
}

export default function HistoricoPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders by period
  const filteredOrders = orders.filter(order => {
    if (selectedPeriod === 'all') return true
    
    const orderDate = new Date(order.created_at)
    const now = new Date()
    
    switch (selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return orderDate >= weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return orderDate >= monthAgo
      case 'year':
        return orderDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  })

  // Calculate statistics
  const totalSpent = filteredOrders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)
  
  const completedOrders = filteredOrders.filter(o => o.status === 'entregue').length
  const totalItems = filteredOrders.reduce((sum, o) => 
    sum + (o.order_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
  )

  // Group orders by month
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const date = new Date(order.created_at)
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`
    if (!groups[key]) groups[key] = []
    groups[key].push(order)
    return groups
  }, {} as Record<string, Order[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Histórico de Compras</h1>
          <p className="text-slate-500 dark:text-slate-400">Veja todas as suas compras e estatísticas</p>
        </div>
        
        {/* Period Filter */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Tudo' },
            { value: 'week', label: '7 dias' },
            { value: 'month', label: '30 dias' },
            { value: 'year', label: 'Ano' }
          ].map(period => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={selectedPeriod === period.value 
                ? 'bg-violet-500 text-white' 
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-violet-200 dark:border-violet-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredOrders.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total de Pedidos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                R$ {totalSpent.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Gasto</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedOrders}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pedidos Entregues</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Star className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalItems}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Itens Comprados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {Object.keys(groupedOrders).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedOrders).map(([month, monthOrders]) => (
            <div key={month}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                {month}
              </h3>
              
              <div className="space-y-3">
                {monthOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pedido_feito
                  
                  return (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-full text-xs ${status.bgColor} ${status.color}`}>
                              {status.label}
                            </div>
                            <div>
                              <p className="text-slate-900 dark:text-white font-medium">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(order.created_at).toLocaleDateString('pt-BR', { 
                                  day: 'numeric', 
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-violet-600 dark:text-violet-400 font-semibold">
                              R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {order.order_items?.length || 0} itens
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-800">
                        <div className="p-4 space-y-4">
                              {order.order_items?.map((item) => (
                                <div key={item.id} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                  {/* Imagem do Produto */}
                                  <div className="relative w-20 h-20 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                                    {item.product_image ? (
                                      <img 
                                        src={item.product_image} 
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-8 h-8 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Informações do Item */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="text-slate-900 dark:text-white font-medium">{item.product_name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {item.size || 'Padrão'}
                                          {item.bowl_type && ` • ${item.bowl_type}`}
                                        </p>
                                      </div>
                                      <span className="text-violet-600 dark:text-violet-400 font-semibold">
                                        x{item.quantity}
                                      </span>
                                    </div>
                                    
                                    {/* Vasilha */}
                                    {item.bowl_image && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <img 
                                          src={item.bowl_image} 
                                          alt={item.bowl_type || 'Vasilha'}
                                          className="w-6 h-6 object-cover rounded"
                                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                        />
                                        <span className="text-xs text-slate-500">{item.bowl_type}</span>
                                      </div>
                                    )}
                                    
                                    {/* Toppings/Condimentos */}
                                    {item.toppings && item.toppings.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {item.toppings.map((topping, idx) => (
                                          <div key={idx} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-1">
                                            {topping.image && (
                                              <img 
                                                src={topping.image} 
                                                alt={topping.name}
                                                className="w-4 h-4 object-cover rounded-full"
                                              />
                                            )}
                                            <span className="text-xs text-slate-600 dark:text-slate-300">{topping.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Molhos */}
                                    {item.sauces && item.sauces.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Molhos:</span>
                                        {item.sauces.map((sauce, idx) => (
                                          <div key={idx} className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 rounded-full px-2 py-1">
                                            {sauce.image && (
                                              <img 
                                                src={sauce.image} 
                                                alt={sauce.name}
                                                className="w-4 h-4 object-cover rounded-full"
                                              />
                                            )}
                                            <span className="text-xs text-orange-600 dark:text-orange-400">{sauce.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400">{order.payment_method || 'Dinheiro'}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Recibo
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Nenhuma compra encontrada</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Você ainda não tem compras neste período</p>
          <Button 
            className="bg-violet-500 hover:bg-violet-600 text-white"
            onClick={() => window.location.href = '/cardapio'}
          >
            Explorar Cardápio
          </Button>
        </div>
      )}
    </div>
  )
}
