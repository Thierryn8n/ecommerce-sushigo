'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, MessageCircle, Truck, CheckCircle, XCircle, Clock, ChefHat, Loader2 } from 'lucide-react'
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
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    // Usar mapeamento de filtros para agrupar status similares
    const allowedStatuses = selectedStatus ? (statusFilterMap[selectedStatus] || [selectedStatus]) : null
    const matchesStatus = !selectedStatus || (allowedStatuses ? allowedStatuses.includes(order.status) : true)
    return matchesSearch && matchesStatus
  })

  const getStatusCount = (status: string) => {
    const allowedStatuses = statusFilterMap[status] || [status]
    return orders.filter(o => allowedStatuses.includes(o.status)).length
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
        
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
              <div className="flex gap-2">
                <span className="px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-500 text-sm font-medium">
                  5 Pendentes
                </span>
                <span className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-500 text-sm font-medium">
                  3 Preparando
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-2xl p-4 border border-border mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                  <Input
                    type="text"
                    placeholder="Buscar por ID ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#2a1a35] border-border text-foreground"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  <Button
                    variant={selectedStatus === null ? 'default' : 'outline'}
                    onClick={() => setSelectedStatus(null)}
                    size="sm"
                    className={selectedStatus === null ? 'bg-[#FF8C00]' : 'border-border text-foreground/70'}
                  >
                    Todos
                  </Button>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedStatus === key ? 'default' : 'outline'}
                      onClick={() => setSelectedStatus(key)}
                      size="sm"
                      className={selectedStatus === key ? 'bg-[#FF8C00]' : 'border-border text-foreground/70'}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid gap-4">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pendente
                const StatusIcon = status?.icon || Clock
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-6 border border-border"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-foreground font-bold text-lg">{order.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.bg} ${status.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          <span className="text-foreground/50 text-sm">{order.time} atrás</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-foreground font-medium">{order.customer}</p>
                            <p className="text-foreground/50 text-sm">{order.phone}</p>
                          </div>
                          <div>
                            <p className="text-foreground/70 text-sm">{order.address}</p>
                            <p className="text-foreground/50 text-sm">Pagamento: {order.payment}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-foreground/70 text-sm">
                            {order.items.map(item => `${item.qty}x ${item.name}`).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-right">
                          <p className="text-foreground/50 text-sm">Total</p>
                          <p className="text-[#00BFFF] font-bold text-xl">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-border text-foreground/70 hover:bg-[#2a1a35]">
                            <Eye className="w-4 h-4 mr-2" />
                            Detalhes
                          </Button>
                          <Button size="sm" className="bg-[#25D366] hover:bg-[#20bd5a] text-foreground">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Status Actions */}
                    {order.status !== 'entregue' && order.status !== 'cancelado' && (
                      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                        <p className="text-foreground/50 text-sm mr-2">Atualizar status:</p>
                        {updating === order.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#FF8C00]" />
                        ) : (
                          <>
                            {(order.status === 'pendente' || order.status === 'confirmado') && (
                              <Button 
                                size="sm" 
                                className="bg-blue-500 hover:bg-blue-600 text-foreground"
                                onClick={() => updateStatus(order.id, 'preparando')}
                              >
                                <ChefHat className="w-4 h-4 mr-2" />
                                Preparando
                              </Button>
                            )}
                            {order.status === 'preparando' && (
                              <Button 
                                size="sm" 
                                className="bg-purple-500 hover:bg-purple-600 text-foreground"
                                onClick={() => updateStatus(order.id, 'saiu_entrega')}
                              >
                                <Truck className="w-4 h-4 mr-2" />
                                Saiu p/ Entrega
                              </Button>
                            )}
                            {order.status === 'saiu_entrega' && (
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600 text-foreground"
                                onClick={() => updateStatus(order.id, 'entregue')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Entregue
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              onClick={() => updateStatus(order.id, 'cancelado')}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancelar
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
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <p className="text-foreground/60">Nenhum pedido encontrado</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
