'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
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
  AlertCircle,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import type { RealtimeChannel } from '@supabase/supabase-js'

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
  const [notifications, setNotifications] = useState<{id: string, message: string}[]>([])
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const notificationChannelRef = useRef<RealtimeChannel | null>(null)

  // Mostrar notificação de atualização de status
  const showStatusNotification = useCallback((message: string) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message }])
    
    // Vibrar dispositivo se suportado
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
    
    // Remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  useEffect(() => {
    fetchOrders()
    
    // Subscribe to realtime updates for orders
    const ordersChannel = supabase
      .channel('user_orders_realtime')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updatedOrder = payload.new as Order
          setOrders(prev => prev.map(o => {
            if (o.id === updatedOrder.id) {
              // Mostrar notificação se status mudou
              if (o.status !== updatedOrder.status) {
                const statusInfo = statusConfig[updatedOrder.status] || statusConfig.pedido_feito
                showStatusNotification(`Pedido #${updatedOrder.id.slice(-6).toUpperCase()} - ${statusInfo.label}`)
              }
              return { ...o, ...updatedOrder }
            }
            return o
          }))
        }
      )
      .subscribe()

    channelRef.current = ordersChannel

    // Subscribe to notifications for the user
    async function setupNotificationChannel() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const notifChannel = supabase
        .channel('user_notifications')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const notif = payload.new as { title: string, message: string }
            showStatusNotification(`${notif.title}: ${notif.message}`)
          }
        )
        .subscribe()

      notificationChannelRef.current = notifChannel
    }

    setupNotificationChannel()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
      if (notificationChannelRef.current) {
        supabase.removeChannel(notificationChannelRef.current)
      }
    }
  }, [supabase, showStatusNotification])

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Toasts */}
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 z-50 bg-violet-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span className="font-medium">{notif.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Rastrear Pedidos</h1>
        <p className="text-slate-500 dark:text-slate-400">Acompanhe o status dos seus pedidos em tempo real</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar por numero do pedido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-500" />
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
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                {/* Order Header */}
                <div 
                  className="p-4 sm:p-5 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`p-2 sm:p-3 rounded-xl ${status.bgColor}`}>
                        <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${status.color}`} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-slate-900 dark:text-white font-semibold">{status.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">{status.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-violet-600 dark:text-violet-400 font-bold text-base sm:text-lg">
                        R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Status Flow */}
                  <div className="mt-4 sm:mt-6">
                    <div className="flex items-center justify-between relative">
                      {statusFlow.map((flowStatus, index) => {
                        const flowConfig = statusConfig[flowStatus]
                        const isActive = isStatusActive(order.status, flowStatus)
                        const isCurrent = order.status === flowStatus
                        
                        return (
                          <div key={flowStatus} className="flex flex-col items-center z-10">
                            <motion.div 
                              animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
                              className={`
                                w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                                transition-all duration-300
                                ${isActive 
                                  ? isCurrent 
                                    ? 'bg-violet-500 text-white scale-105 sm:scale-110' 
                                    : 'bg-green-500/20 text-green-500'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }
                              `}
                            >
                              {isActive && !isCurrent ? (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <flowConfig.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </motion.div>
                            <span className={`
                              text-[10px] sm:text-xs mt-1 sm:mt-2 text-center w-14 sm:w-20 leading-tight
                              ${isActive ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}
                            `}>
                              {flowConfig.label}
                            </span>
                          </div>
                        )
                      })}
                      
                      {/* Progress Line */}
                      <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-violet-500 to-green-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(getStatusIndex(order.status) / (statusFlow.length - 1)) * 100}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
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
                      className="border-t border-slate-200 dark:border-slate-800"
                    >
                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Items */}
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-medium mb-3">Itens do Pedido</h4>
                          <div className="space-y-2">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <div>
                                  <p className="text-slate-700 dark:text-slate-300">{item.product_name}</p>
                                  {item.toppings?.length > 0 && (
                                    <p className="text-xs text-slate-500">
                                      + {item.toppings.join(', ')}
                                    </p>
                                  )}
                                  <p className="text-xs text-slate-500">Qtd: {item.quantity}</p>
                                </div>
                                <p className="text-violet-600 dark:text-violet-400">
                                  R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-violet-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-slate-500">Endereco</p>
                              <p className="text-slate-700 dark:text-slate-300 text-sm">{order.delivery_address || 'Retirada'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-violet-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-slate-500">Telefone</p>
                              <p className="text-slate-700 dark:text-slate-300 text-sm">{order.phone || '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-violet-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-slate-500">Pagamento</p>
                              <p className="text-slate-700 dark:text-slate-300 text-sm">{order.payment_method || 'Dinheiro'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-violet-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-slate-500">Data</p>
                              <p className="text-slate-700 dark:text-slate-300 text-sm">
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
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
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
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
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
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${status.bgColor}`}>
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">#{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{status.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 dark:text-white font-semibold">
                        R$ {order.total_amount?.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
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
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Package className="w-12 sm:w-16 h-12 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">Nenhum pedido encontrado</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 px-4">Voce ainda nao fez nenhum pedido</p>
          <Button 
            className="bg-violet-500 hover:bg-violet-600 text-white"
            onClick={() => window.location.href = '/cardapio'}
          >
            Fazer Primeiro Pedido
          </Button>
        </div>
      )}

      {/* Search No Results */}
      {orders.length > 0 && filteredOrders.length === 0 && (
        <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Nenhum pedido encontrado com este termo</p>
        </div>
      )}
    </div>
  )
}
