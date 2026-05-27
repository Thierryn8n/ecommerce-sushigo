'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, MessageCircle, Truck, CheckCircle, XCircle, Clock, ChefHat, Loader2, CalendarDays, CreditCard, Filter, X } from 'lucide-react'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from '@/lib/utils'

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  total: number
  payment_method: string
  payment_status: string
  status: string
  delivery_address: string
  created_at: string
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
  }>
}

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: typeof Clock }> = {
  pendente: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Pendente', icon: Clock },
  confirmado: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Confirmado', icon: Clock },
  preparando: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Preparando', icon: ChefHat },
  saiu_entrega: { bg: 'bg-purple-500/20', text: 'text-purple-500', label: 'Saiu p/ Entrega', icon: Truck },
  entregue: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Entregue', icon: CheckCircle },
  cancelado: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Cancelado', icon: XCircle },
  // Mapeamento de status alternativos do banco
  pedido_feito: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Pendente', icon: Clock },
  em_preparo: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Preparando', icon: ChefHat },
  pronto: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Pronto', icon: CheckCircle },
}

// Mapeamento de filtros para grupos de status
const statusFilterMap: Record<string, string[]> = {
  pendente: ['pendente', 'pedido_feito', 'confirmado'],
  preparando: ['preparando', 'em_preparo'],
  saiu_entrega: ['saiu_entrega'],
  entregue: ['entregue', 'pronto'],
  cancelado: ['cancelado'],
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Buscar pedidos do Supabase
  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(product_name, quantity, unit_price)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedOrders: Order[] = (data || []).map((order: any) => ({
        ...order,
        total: order.total,
        items: order.items || []
      }))

      setOrders(formattedOrders)
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // Realtime subscription para sincronizar com kanban
  useEffect(() => {
    fetchOrders()

    const subscription = supabase
      .channel('orders_list_updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_status_history' },
        () => fetchOrders()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchOrders, supabase])

  // Função para atualizar status
  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const { error } = await supabase.rpc('kanban_move_order', {
        order_id: orderId,
        new_status: newStatus
      })

      if (error) throw error

      toast({
        title: 'Status atualizado',
        description: `Pedido movido para ${statusConfig[newStatus]?.label || newStatus}`,
      })

      await fetchOrders()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive'
      })
    } finally {
      setUpdating(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase())

    const allowedStatuses = selectedStatus ? (statusFilterMap[selectedStatus] || [selectedStatus]) : null
    const matchesStatus = !selectedStatus || (allowedStatuses ? allowedStatuses.includes(order.status) : true)

    const matchesPayment = !selectedPayment || order.payment_method?.toLowerCase().includes(selectedPayment.toLowerCase())

    let matchesDate = true
    if (selectedDate) {
      const orderDate = new Date(order.created_at)
      const now = new Date()
      if (selectedDate === 'hoje') {
        matchesDate = orderDate.toDateString() === now.toDateString()
      } else if (selectedDate === 'ontem') {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        matchesDate = orderDate.toDateString() === yesterday.toDateString()
      } else if (selectedDate === 'semana') {
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        matchesDate = orderDate >= weekAgo
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate
  })

  const getStatusCount = (status: string) => {
    const allowedStatuses = statusFilterMap[status] || [status]
    return orders.filter(o => allowedStatuses.includes(o.status)).length
  }

  const paymentMethods = [...new Set(orders.map(o => o.payment_method).filter(Boolean))]

  const hasActiveFilters = selectedStatus || selectedDate || selectedPayment || searchTerm

  const clearFilters = () => {
    setSelectedStatus(null)
    setSelectedDate(null)
    setSelectedPayment(null)
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:ml-56">
          <AdminHeader />
          <main className="p-6 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
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
        
        <main className="p-3 sm:p-6 pb-20 lg:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pedidos</h1>
                <p className="text-foreground/50 text-xs sm:text-sm mt-1">{filteredOrders.length} de {orders.length} pedidos</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(statusFilterMap).map(([key]) => {
                  const config = statusConfig[key]
                  const count = getStatusCount(key)
                  if (!config || count === 0) return null
                  return (
                    <span key={key} className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg ${config.bg} ${config.text} text-[10px] sm:text-sm font-medium`}>
                      {count} {config.label}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border mb-4 sm:mb-6 space-y-3">
              {/* Search */}
              <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                  <Input
                    type="text"
                    placeholder="Buscar pedidos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 border-border text-foreground text-sm"
                  />
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="border-red-500/50 text-red-400 hover:bg-red-500/10 gap-1 shrink-0 text-xs sm:text-sm">
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    Limpar
                  </Button>
                )}
              </div>

              {/* Status filters - scrollable on mobile */}
              <div className="flex gap-2 flex-wrap items-center overflow-x-auto pb-2">
                <span className="text-foreground/40 text-[10px] sm:text-xs flex items-center gap-1 shrink-0"><Filter className="w-3 h-3" /> Status:</span>
                <Button
                  variant={selectedStatus === null ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus(null)}
                  size="sm"
                  className={selectedStatus === null ? 'bg-[#FF8C00] text-white h-6 sm:h-7 text-[10px] sm:text-xs shrink-0' : 'border-border text-foreground/70 h-6 sm:h-7 text-[10px] sm:text-xs shrink-0'}
                >
                  Todos
                </Button>
                {Object.entries(statusFilterMap).map(([key]) => {
                  const config = statusConfig[key]
                  if (!config) return null
                  const count = getStatusCount(key)
                  return (
                    <Button
                      key={key}
                      variant={selectedStatus === key ? 'default' : 'outline'}
                      onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
                      size="sm"
                      className={selectedStatus === key ? 'bg-[#FF8C00] text-white h-6 sm:h-7 text-[10px] sm:text-xs shrink-0' : 'border-border text-foreground/70 h-6 sm:h-7 text-[10px] sm:text-xs shrink-0'}
                    >
                      {config.label}
                    </Button>
                  )
                })}
              </div>

              {/* Date + Payment filters */}
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-foreground/40 text-[10px] sm:text-xs flex items-center gap-1 shrink-0"><CalendarDays className="w-3 h-3" /> Data:</span>
                {['hoje', 'ontem', 'semana'].map(d => (
                  <Button
                    key={d}
                    variant={selectedDate === d ? 'default' : 'outline'}
                    onClick={() => setSelectedDate(selectedDate === d ? null : d)}
                    size="sm"
                    className={selectedDate === d ? 'bg-[#FF8C00] text-white h-6 sm:h-7 text-[10px] sm:text-xs' : 'border-border text-foreground/70 h-6 sm:h-7 text-[10px] sm:text-xs'}
                  >
                    {d === 'hoje' ? 'Hoje' : d === 'ontem' ? 'Ontem' : 'Semana'}
                  </Button>
                ))}
                {paymentMethods.length > 0 && (
                  <>
                    <span className="text-foreground/40 text-[10px] sm:text-xs flex items-center gap-1 ml-2 shrink-0"><CreditCard className="w-3 h-3" /> Pgto:</span>
                    {paymentMethods.map(method => (
                      <Button
                        key={method}
                        variant={selectedPayment === method ? 'default' : 'outline'}
                        onClick={() => setSelectedPayment(selectedPayment === method ? null : method)}
                        size="sm"
                        className={selectedPayment === method ? 'bg-[#FF8C00] text-white h-6 sm:h-7 text-[10px] sm:text-xs' : 'border-border text-foreground/70 h-6 sm:h-7 text-[10px] sm:text-xs'}
                      >
                        {method}
                      </Button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid gap-3 sm:gap-4">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pendente
                const StatusIcon = status?.icon || Clock
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-border"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                          <span className="text-foreground font-bold text-base sm:text-lg">#{order.id.slice(-6)}</span>
                          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 ${status.bg} ${status.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          <span className="text-foreground/50 text-[10px] sm:text-sm">{order.time} atrás</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 sm:gap-4">
                          <div>
                            <p className="text-foreground font-medium text-sm">{order.customer}</p>
                            <p className="text-foreground/50 text-xs sm:text-sm">{order.phone}</p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-foreground/70 text-sm">{order.address}</p>
                            <p className="text-foreground/50 text-xs sm:text-sm">Pagamento: {order.payment}</p>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                          <p className="text-foreground/70 text-xs sm:text-sm line-clamp-2">
                            {order.items.map(item => `${item.qty}x ${item.name}`).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 sm:gap-4 items-start sm:items-center">
                        <div className="text-right">
                          <p className="text-foreground/50 text-[10px] sm:text-sm">Total</p>
                          <p className="text-[#00BFFF] font-bold text-base sm:text-xl">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                          <Button size="sm" variant="outline" className="border-border text-foreground/70 hover:bg-[#2a1a35] flex-1 sm:flex-none text-xs h-8 sm:h-auto">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Detalhes</span>
                          </Button>
                          <Button size="sm" className="bg-[#25D366] hover:bg-[#20bd5a] text-foreground flex-1 sm:flex-none text-xs h-8 sm:h-auto">
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Status Actions */}
                    {order.status !== 'entregue' && order.status !== 'cancelado' && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex flex-wrap gap-1 sm:gap-2">
                        <p className="text-foreground/50 text-[10px] sm:text-sm mr-1 sm:mr-2 w-full sm:w-auto">Atualizar:</p>
                        {updating === order.id ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#FF8C00]" />
                        ) : (
                          <>
                            {(order.status === 'pendente' || order.status === 'confirmado') && (
                              <Button 
                                size="sm" 
                                className="bg-blue-500 hover:bg-blue-600 text-foreground text-xs h-7 sm:h-auto"
                                onClick={() => updateStatus(order.id, 'preparando')}
                              >
                                <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Preparando</span>
                                <span className="sm:hidden">Prep</span>
                              </Button>
                            )}
                            {order.status === 'preparando' && (
                              <Button 
                                size="sm" 
                                className="bg-purple-500 hover:bg-purple-600 text-foreground text-xs h-7 sm:h-auto"
                                onClick={() => updateStatus(order.id, 'saiu_entrega')}
                              >
                                <Truck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Saiu p/ Entrega</span>
                                <span className="sm:hidden">Saiu</span>
                              </Button>
                            )}
                            {order.status === 'saiu_entrega' && (
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600 text-foreground text-xs h-7 sm:h-auto"
                                onClick={() => updateStatus(order.id, 'entregue')}
                              >
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Entregue</span>
                                <span className="sm:hidden">Ok</span>
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs h-7 sm:h-auto"
                              onClick={() => updateStatus(order.id, 'cancelado')}
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Cancelar</span>
                              <span className="sm:hidden">Can</span>
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {filteredOrders.length === 0 && (
              <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-12 border border-border text-center">
                <p className="text-foreground/60 text-sm">Nenhum pedido encontrado</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
