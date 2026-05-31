'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Package, 
  Search, 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Truck, 
  XCircle,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  toppings: string[]
  sauces: string[]
}

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  delivery_address: string
  phone: string
  payment_method: string
  order_items: OrderItem[]
  estimated_delivery?: string
}

const statusConfig: Record<string, {
  label: string
  icon: any
  color: string
  bgColor: string
  description: string
}> = {
  pedido_feito: {
    label: 'Pedido Recebido',
    icon: CheckCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    description: 'Seu pedido foi recebido e está sendo processado'
  },
  confirmado: {
    label: 'Confirmado',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    description: 'Pedido confirmado e em preparação'
  },
  preparando: {
    label: 'Em Preparo',
    icon: ChefHat,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    description: 'Seu pedido está sendo preparado com carinho'
  },
  em_preparo: {
    label: 'Em Preparo',
    icon: ChefHat,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    description: 'Seu pedido está sendo preparado com carinho'
  },
  saiu_entrega: {
    label: 'Saiu para Entrega',
    icon: Truck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
    description: 'O entregador está a caminho'
  },
  entregue: {
    label: 'Entregue',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    description: 'Pedido entregue com sucesso!'
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    description: 'Pedido foi cancelado'
  }
}

const statusFlow = [
  'pedido_feito',
  'confirmado', 
  'preparando',
  'saiu_entrega',
  'entregue'
]

export default function RastreioPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('user_orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
      console.error('Erro ao buscar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeOrders = filteredOrders.filter(o => 
    !['entregue', 'cancelado'].includes(o.status)
  )
  
  const completedOrders = filteredOrders.filter(o => 
    ['entregue', 'cancelado'].includes(o.status)
  )

  function getStatusIndex(status: string) {
    return statusFlow.indexOf(status)
  }

  function isStatusActive(orderStatus: string, flowStatus: string) {
    const orderIndex = getStatusIndex(orderStatus)
    const flowIndex = getStatusIndex(flowStatus)
    return orderIndex >= flowIndex && orderIndex !== -1
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8C00]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Rastrear Pedidos</h1>
        <p className="text-gray-400">Acompanhe o status dos seus pedidos em tempo real</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <Input
          type="text"
          placeholder="Buscar por número do pedido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-[#1a1a1a] border-[#FF8C00]/20 text-white placeholder:text-gray-500"
        />
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF8C00]" />
            Pedidos em Andamento ({activeOrders.length})
          </h2>
          
          {activeOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pedido_feito
            const StatusIcon = status.icon
            const isExpanded = expandedOrder === order.id
            
            return (
              <motion.div
                key={order.id}
                layout
                className="bg-[#1a1a1a] rounded-2xl border border-[#FF8C00]/20 overflow-hidden"
              >
                {/* Order Header */}
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => setIsExpanded(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${status.bgColor}`}>
                        <StatusIcon className={`w-6 h-6 ${status.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-white font-semibold">{status.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{status.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FF8C00] font-bold text-lg">
                        R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Status Flow */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between relative">
                      {statusFlow.map((flowStatus, index) => {
                        const flowConfig = statusConfig[flowStatus]
                        const isActive = isStatusActive(order.status, flowStatus)
                        const isCurrent = order.status === flowStatus
                        
                        return (
                          <div key={flowStatus} className="flex flex-col items-center z-10">
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center
                              transition-all duration-300
                              ${isActive 
                                ? isCurrent 
                                  ? 'bg-[#FF8C00] text-white scale-110' 
                                  : 'bg-green-500/20 text-green-500'
                                : 'bg-[#2a2a2a] text-gray-600'
                              }
                            `}>
                              {isActive && !isCurrent ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <flowConfig.icon className="w-5 h-5" />
                              )}
                            </div>
                            <span className={`
                              text-xs mt-2 text-center w-20
                              ${isActive ? 'text-white' : 'text-gray-600'}
                            `}>
                              {flowConfig.label}
                            </span>
                          </div>
                        )
                      })}
                      
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#2a2a2a] -z-0">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FF8C00] to-green-500 transition-all duration-500"
                          style={{ 
                            width: `${(getStatusIndex(order.status) / (statusFlow.length - 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#FF8C00]/10"
                    >
                      <div className="p-5 space-y-4">
                        {/* Items */}
                        <div>
                          <h4 className="text-white font-medium mb-3">Itens do Pedido</h4>
                          <div className="space-y-2">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                <div>
                                  <p className="text-gray-300">{item.product_name}</p>
                                  {item.toppings?.length > 0 && (
                                    <p className="text-xs text-gray-500">
                                      + {item.toppings.join(', ')}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                                </div>
                                <p className="text-[#FF8C00]">
                                  R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-[#FF8C00]" />
                            <div>
                              <p className="text-xs text-gray-500">Endereço</p>
                              <p className="text-gray-300 text-sm">{order.delivery_address || 'Retirada'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-[#FF8C00]" />
                            <div>
                              <p className="text-xs text-gray-500">Telefone</p>
                              <p className="text-gray-300 text-sm">{order.phone || '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-[#FF8C00]" />
                            <div>
                              <p className="text-xs text-gray-500">Pagamento</p>
                              <p className="text-gray-300 text-sm">{order.payment_method || 'Dinheiro'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-[#FF8C00]" />
                            <div>
                              <p className="text-xs text-gray-500">Data</p>
                              <p className="text-gray-300 text-sm">
                                {new Date(order.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expand Button */}
                <button
                  onClick={() => setIsExpanded(isExpanded ? null : order.id)}
                  className="w-full py-3 bg-[#0f0f0f] border-t border-[#FF8C00]/10 text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  {isExpanded ? (
                    <>Ver menos <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Ver detalhes <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Pedidos Finalizados ({completedOrders.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.entregue
              const StatusIcon = status.icon
              
              return (
                <div
                  key={order.id}
                  className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${status.bgColor}`}>
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">#{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-gray-300 font-medium">{status.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No Orders */}
      {orders.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum pedido encontrado</h3>
          <p className="text-gray-400 mb-6">Você ainda não fez nenhum pedido</p>
          <Button 
            className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
            onClick={() => window.location.href = '/cardapio'}
          >
            Fazer Pedido
          </Button>
        </div>
      )}

      {/* Search No Results */}
      {orders.length > 0 && filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum pedido encontrado com este termo</p>
        </div>
      )}
    </div>
  )
}
