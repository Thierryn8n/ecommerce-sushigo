'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { 
  Clock, 
  Package, 
  CheckCircle, 
  Truck, 
  Home, 
  XCircle,
  MapPin,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  History,
  ShoppingBag,
  User,
  Navigation,
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  DollarSign,
  Hash,
  Timer,
  Receipt,
  Search,
  Filter
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

interface OrderStatusColumn {
  id: string
  name: string
  slug: string
  color: string
  display_order: number
}

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
}

interface StatusHistory {
  from_status: string
  to_status: string
  moved_at: string
  moved_by_name: string | null
}

interface KanbanOrder {
  id: string
  customer_name: string
  customer_phone: string
  total_amount: number
  payment_method: string
  payment_status: string
  current_status_slug: string
  current_status_name: string
  status_color: string
  delivery_address: string | null
  created_at: string
  estimated_delivery_time: string | null
  cancelled_at?: string  // Apenas para pedidos cancelados
  items: OrderItem[]
  status_history: StatusHistory[]
}

interface KanbanColumn {
  status: OrderStatusColumn
  orders: KanbanOrder[]
}

const statusIcons: Record<string, React.ReactNode> = {
  pedido_feito: <Clock className="w-5 h-5" />,
  em_preparo: <Package className="w-5 h-5" />,
  pronto: <CheckCircle className="w-5 h-5" />,
  saiu_entrega: <Truck className="w-5 h-5" />,
  entregue: <Home className="w-5 h-5" />,
  cancelado: <XCircle className="w-5 h-5" />,
}

const statusFlow = ['pedido_feito', 'em_preparo', 'pronto', 'saiu_entrega', 'entregue']

export function KanbanBoard() {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [cancelledOrders, setCancelledOrders] = useState<KanbanOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<KanbanOrder | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [activeColumnIndex, setActiveColumnIndex] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const [showCancelled, setShowCancelled] = useState(true)
  
  // Estados do Carrossel
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [columnsPerView, setColumnsPerView] = useState(3)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedOrder, setDraggedOrder] = useState<KanbanOrder | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  
  const supabase = createClient()
  const touchStartX = useRef<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      // Ajustar colunas por view baseado no tamanho da tela (colunas mais estreitas)
      if (window.innerWidth < 1024) {
        setColumnsPerView(1)
      } else if (window.innerWidth < 1280) {
        setColumnsPerView(2)
      } else if (window.innerWidth < 1536) {
        setColumnsPerView(3)
      } else {
        setColumnsPerView(4)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Funções de navegação do carrossel
  const goToNext = useCallback(() => {
    setCarouselIndex(prev => Math.min(columns.length - columnsPerView, prev + 1))
  }, [columns.length, columnsPerView])

  const goToPrev = useCallback(() => {
    setCarouselIndex(prev => Math.max(0, prev - 1))
  }, [])

  // Auto-scroll durante drag
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !carouselRef.current) return

    const container = carouselRef.current
    const rect = container.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    
    // Zona de trigger (50px das bordas)
    const triggerZone = 50
    const isNearRightEdge = clientX > rect.right - triggerZone
    const isNearLeftEdge = clientX < rect.left + triggerZone

    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current)
    }

    if (isNearRightEdge && carouselIndex < columns.length - columnsPerView) {
      autoScrollTimer.current = setTimeout(() => {
        goToNext()
      }, 300) // Delay de 300ms antes de avançar
    } else if (isNearLeftEdge && carouselIndex > 0) {
      autoScrollTimer.current = setTimeout(() => {
        goToPrev()
      }, 300)
    }
  }, [isDragging, carouselIndex, columns.length, columnsPerView, goToNext, goToPrev])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('touchmove', handleDragMove)
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('touchmove', handleDragMove)
      if (autoScrollTimer.current) {
        clearTimeout(autoScrollTimer.current)
      }
    }
  }, [isDragging, handleDragMove])

  const fetchData = useCallback(async () => {
    try {
      // Buscar colunas (exceto cancelado para o kanban)
      const { data: statusColumns } = await supabase
        .from('order_status_columns')
        .select('*')
        .eq('is_active', true)
        .neq('slug', 'cancelado')  // Excluir cancelado das colunas do kanban
        .order('display_order')

      if (!statusColumns) return

      // Buscar pedidos do kanban (não cancelados)
      const { data: orders } = await supabase
        .from('kanban_orders')
        .select('*')
        .neq('current_status_slug', 'cancelado')  // Excluir cancelados

      // Buscar pedidos cancelados separadamente
      const { data: cancelled, error: cancelledError } = await supabase
        .from('cancelled_orders')
        .select('*')
        .limit(20)  // Limitar para performance

      if (cancelledError) {
        console.error('Erro ao buscar cancelados:', cancelledError)
      }

      console.log('Pedidos cancelados encontrados:', cancelled?.length || 0, cancelled)

      const kanbanColumns: KanbanColumn[] = statusColumns.map(col => ({
        status: col,
        orders: orders?.filter(o => o.current_status_slug === col.slug) || []
      }))

      setColumns(kanbanColumns)
      setCancelledOrders(cancelled || [])
    } catch (error) {
      console.error('Erro ao buscar kanban:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()

    const subscription = supabase
      .channel('kanban_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchData()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_status_history' },
        () => fetchData()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchData, supabase])

  const moveOrder = async (orderId: string, newStatusSlug: string) => {
    try {
      const { error } = await supabase.rpc('kanban_move_order', {
        order_id: orderId,
        new_status: newStatusSlug
      })

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Erro ao mover pedido:', error)
    }
  }

  // Mobile swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    const minSwipeDistance = 50

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && activeColumnIndex < columns.length - 1) {
        setActiveColumnIndex(prev => prev + 1)
      } else if (diff < 0 && activeColumnIndex > 0) {
        setActiveColumnIndex(prev => prev - 1)
      }
    }
    touchStartX.current = null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8C00]"></div>
      </div>
    )
  }

  // MOBILE VIEW
  if (isMobile) {
    const activeColumn = columns[activeColumnIndex]
    
    return (
      <div className="min-h-[calc(100vh-7rem)] flex flex-col overflow-x-auto">
        {/* Header com navegação */}
        <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveColumnIndex(prev => Math.max(0, prev - 1))}
            disabled={activeColumnIndex === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              {activeColumn && statusIcons[activeColumn.status.slug]}
              <span className="font-semibold text-foreground">
                {activeColumn?.status.name}
              </span>
              <Badge variant="secondary" className="ml-1">
                {activeColumn?.orders.length || 0}
              </Badge>
            </div>
            <div className="flex gap-1 mt-1">
              {columns.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === activeColumnIndex ? 'bg-[#FF8C00]' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveColumnIndex(prev => Math.min(columns.length - 1, prev + 1))}
            disabled={activeColumnIndex === columns.length - 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Header Mobile Stats */}
        <div className="px-4 py-3 bg-muted border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">
                {columns.reduce((acc, col) => acc + col.orders.length, 0)} pedidos
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelled(!showCancelled)}
              className={`h-8 px-2 ${cancelledOrders.length > 0 ? 'text-red-500' : ''}`}
            >
              <XCircle className="w-4 h-4 mr-1" />
              {cancelledOrders.length > 0 && (
                <Badge variant="destructive" className="text-xs">{cancelledOrders.length}</Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Seção de Cancelados Mobile - Premium */}
        <AnimatePresence>
          {showCancelled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-muted border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-red-500/20 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">Cancelados</span>
                  {cancelledOrders.length > 0 ? (
                    <Badge variant="destructive" className="text-xs">{cancelledOrders.length}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Nenhum</span>
                  )}
                  <button 
                    onClick={() => setShowCancelled(false)}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                  >
                    Ocultar
                  </button>
                </div>
                
                {cancelledOrders.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {cancelledOrders.map(order => (
                      <motion.div
                        key={order.id}
                        whileTap={{ scale: 0.98 }}
                        className="flex-shrink-0 w-56 bg-card border border-red-500/20 rounded-xl p-3 cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order)
                          setDetailOpen(true)
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-foreground">#{order.id.slice(-6).toUpperCase()}</span>
                          <Badge variant="destructive" className="text-[10px]">CANCELADO</Badge>
                        </div>
                        <p className="font-medium text-sm text-foreground truncate">{order.customer_name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDateTime(order.cancelled_at || order.created_at)}
                          </span>
                          <span className="font-semibold text-red-500">
                            R$ {formatPrice(order.total_amount)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground py-2">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">Nenhum pedido cancelado</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe area */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            {activeColumn && (
              <motion.div
                key={activeColumn.status.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 pb-20"
              >
                {activeColumn.orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Nenhum pedido nesta etapa</p>
                  </div>
                ) : (
                  activeColumn.orders.map(order => (
                    <MobileOrderCard
                      key={order.id}
                      order={order}
                      columns={columns.map(c => c.status)}
                      onMove={moveOrder}
                      onClick={() => {
                        setSelectedOrder(order)
                        setDetailOpen(true)
                      }}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Detail Sheet */}
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent side="bottom" className="h-[85vh] sm:h-[80vh]">
            {selectedOrder && (
              <OrderDetail
                order={selectedOrder}
                columns={columns.map(c => c.status)}
                onMove={(status) => {
                  moveOrder(selectedOrder.id, status)
                  setDetailOpen(false)
                }}
                onClose={() => setDetailOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  // DESKTOP VIEW - Kanban Premium
  const totalOrders = columns.reduce((acc, col) => acc + col.orders.length, 0)
  const totalValue = columns.reduce((acc, col) => acc + col.orders.reduce((sum, o) => sum + o.total_amount, 0), 0)

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          {/* Lado Esquerdo - Título e Stats */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-muted rounded-xl border border-border">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  Kanban de Pedidos
                </h2>
                <Badge variant="secondary" className="font-medium text-xs">
                  {totalOrders} ativos
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs text-muted-foreground">
                  R$ {formatPrice(totalValue)} em vendas • Atualizado {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Lado Direito - Ações */}
          <div className="flex items-center gap-2">
            {/* Botão de Toggle Cancelados */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelled(!showCancelled)}
              className="gap-2 h-9 px-3 rounded-lg"
            >
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                {showCancelled ? 'Ocultar' : 'Cancelados'}
              </span>
              {cancelledOrders.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-[10px] flex items-center justify-center">
                  {cancelledOrders.length}
                </Badge>
              )}
            </Button>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="gap-2 h-9 px-3 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs font-medium">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Seção de Cancelados - Design Premium */}
      <AnimatePresence>
        {showCancelled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-muted border-b border-border px-6 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-muted rounded-xl border border-border">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">Pedidos Cancelados</h3>
                  <p className="text-xs text-muted-foreground">
                    {cancelledOrders.length > 0 
                      ? `${cancelledOrders.length} pedido(s) cancelado(s) recentemente` 
                      : 'Nenhum pedido cancelado'}
                  </p>
                </div>
              </div>
              
              {cancelledOrders.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-red-500/20">
                  {cancelledOrders.map(order => (
                    <motion.div
                      key={order.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="flex-shrink-0 w-60 bg-card border border-border rounded-xl p-3 cursor-pointer hover:shadow-lg hover:border-destructive transition-all"
                      onClick={() => {
                        setSelectedOrder(order)
                        setDetailOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">#{order.id.slice(-6).toUpperCase()}</span>
                          <Badge variant="destructive" className="text-[10px] px-1.5">CANCELADO</Badge>
                        </div>
                        <span className="text-base font-bold text-destructive">
                          R$ {formatPrice(order.total_amount)}
                        </span>
                      </div>
                      <p className="font-medium text-sm text-foreground mb-1 truncate">{order.customer_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(order.cancelled_at || order.created_at)}
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-[10px] text-muted-foreground">
                            {order.items.length} item(ns) • {order.items.reduce((acc, item) => acc + item.quantity, 0)} unidade(s)
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground py-3">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-sm">Nenhum pedido cancelado encontrado</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Kanban Carrossel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Controles do Carrossel */}
        <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {Math.min(columnsPerView, columns.length)} de {columns.length} colunas
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{carouselIndex + 1}</span>
              <span>-</span>
              <span className="font-medium text-foreground">{Math.min(carouselIndex + columnsPerView, columns.length)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrev}
              disabled={carouselIndex === 0}
              className="gap-2 h-8 px-3 rounded-lg border-border/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/30 transition-all disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Anterior</span>
            </Button>
            
            {/* Indicadores de página */}
            <div className="flex items-center gap-1.5 px-2">
              {columns.map((column, idx) => {
                const isActive = idx >= carouselIndex && idx < carouselIndex + columnsPerView
                return (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(Math.min(idx, columns.length - columnsPerView))}
                    className={`h-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-primary w-6'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2'
                    }`}
                    title={column.status.name}
                  />
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={carouselIndex >= columns.length - columnsPerView}
              className="gap-2 h-8 px-3 rounded-lg border-border/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/30 transition-all disabled:opacity-40"
            >
              <span className="text-xs font-medium">Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Área do Carrossel com Auto-Scroll */}
        <div 
          ref={carouselRef}
          className="flex-1 relative overflow-hidden"
          onMouseMove={(e) => isDragging && handleDragMove(e)}
          onTouchMove={(e) => isDragging && handleDragMove(e)}
        >
          {/* Zonas de Auto-Scroll (Visuais) */}
          {isDragging && carouselIndex > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-primary/10 z-10 flex items-center justify-center pointer-events-none">
              <ChevronLeft className="w-6 h-6 text-primary animate-pulse" />
            </div>
          )}
          {isDragging && carouselIndex < columns.length - columnsPerView && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-primary/10 z-10 flex items-center justify-center pointer-events-none">
              <ChevronRight className="w-6 h-6 text-primary animate-pulse" />
            </div>
          )}

          {/* Container das Colunas */}
          <motion.div 
            className="flex gap-2 p-4 h-full"
            animate={{ x: -carouselIndex * (260 + 8) }} // 260px (w-64) + 8px (gap)
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {columns.map((column, colIdx) => (
              <div
                key={column.status.id}
                className={`w-48 flex-shrink-0 transition-all duration-300 flex flex-col h-full ${dragOverColumn === column.status.id ? 'ring-4 ring-[#FF8C00] ring-opacity-50 scale-105' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  setDragOverColumn(column.status.id)
                }}
                onDragLeave={() => {
                  setDragOverColumn(null)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const orderId = e.dataTransfer.getData('orderId')
                  if (orderId) {
                    moveOrder(orderId, column.status.slug)
                  }
                  setIsDragging(false)
                  setDraggedOrder(null)
                  setDragOverColumn(null)
                }}
              >
                {/* Cabeçalho da coluna */}
                <div 
                  className="rounded-t-xl px-4 py-3 flex items-center gap-2 shadow-sm border border-b-0 bg-muted"
                >
                  <div 
                    className="w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm"
                    style={{ backgroundColor: column.status.color }}
                  />
                  <span className="font-bold text-foreground text-sm tracking-tight">{column.status.name}</span>
                  <Badge 
                    variant="secondary" 
                    className="ml-auto text-xs font-bold bg-white/80 dark:bg-slate-800/80 shadow-sm"
                    style={{ color: column.status.color }}
                  >
                    {column.orders.length}
                  </Badge>
                </div>
                
                {/* Área de pedidos */}
                <div className="bg-card rounded-b-xl border-x border-b border-border p-3 space-y-3 flex-1">
                  <AnimatePresence>
                    {column.orders.map(order => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <DesktopOrderCard 
                          order={order} 
                          onMove={moveOrder}
                          columns={columns.map(c => c.status)}
                          onDragStart={() => {
                            setIsDragging(true)
                            setDraggedOrder(order)
                          }}
                          onDragEnd={() => {
                            setIsDragging(false)
                            setDraggedOrder(null)
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer / Instruções */}
        <div className="px-6 py-2.5 bg-muted border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <div className="p-1 bg-violet-500/10 rounded">
                  <MoveHorizontal className="w-3 h-3 text-violet-500" />
                </div>
                <span>Arraste pedidos entre colunas</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="p-1 bg-amber-500/10 rounded">
                  <ChevronLeft className="w-3 h-3 text-amber-500" />
                </div>
                <span>Perto da borda para auto-navegar</span>
                <ChevronRight className="w-3 h-3 text-amber-500" />
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground/60">
              Kanban v2.0 • Açaí da Praia
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// MOBILE ORDER CARD
interface MobileOrderCardProps {
  order: KanbanOrder
  columns: OrderStatusColumn[]
  onMove: (orderId: string, status: string) => void
  onClick: () => void
}

function MobileOrderCard({ order, columns, onMove, onClick }: MobileOrderCardProps) {
  const currentIndex = statusFlow.indexOf(order.current_status_slug)
  const prevStatus = currentIndex > 0 ? statusFlow[currentIndex - 1] : null
  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null
  
  const prevColumn = prevStatus ? columns.find(c => c.slug === prevStatus) : null
  const nextColumn = nextStatus ? columns.find(c => c.slug === nextStatus) : null

  // Cores por método de pagamento
  const paymentColors: Record<string, string> = {
    credit_card: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    debit_card: 'bg-green-500/10 text-green-600 border-green-500/20',
    pix: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    cash: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    wallet: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
    >
      {/* Indicador de cor no topo */}
      <div 
        className="h-1 w-full"
        style={{ backgroundColor: order.status_color }}
      />
      
      {/* Card Content - Clickable */}
      <div 
        onClick={onClick}
        className="p-4 cursor-pointer active:scale-[0.98] transition-transform"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${order.status_color}20` }}
            >
              {statusIcons[order.current_status_slug]}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-muted-foreground" />
                #{order.id.slice(-6).toUpperCase()}
              </p>
              <p className="text-sm text-foreground font-medium truncate">{order.customer_name}</p>
            </div>
          </div>
          <Badge 
            variant="outline"
            className={`text-[10px] px-2 py-0.5 ${
              paymentColors[order.payment_method] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'
            }`}
          >
            {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
          </Badge>
        </div>

        {/* Items Preview */}
        <div className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {order.items?.slice(0, 2).map((item, idx) => (
            <span key={item.product_name}>
              {idx > 0 && <span className="text-border mx-1">•</span>}
              <span className="font-medium text-foreground/80">{item.quantity}x</span>{' '}
              {item.product_name}
            </span>
          ))}
          {(order.items?.length || 0) > 2 && (
            <span className="text-muted-foreground/50"> +{(order.items?.length || 0) - 2}</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {formatDateTime(order.created_at).split(' ')[0]}
          </div>
          <p className="text-xl font-bold text-[#FF8C00]">
            R$ {formatPrice(order.total_amount)}
          </p>
        </div>
      </div>

      {/* Quick Actions - Swipe to move */}
      <div className="flex border-t border-border/60 bg-muted/20">
        {prevColumn && (
          <button
            onClick={() => onMove(order.id, prevColumn.slug)}
            className="flex-1 py-3 px-2 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors active:bg-muted/60"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{prevColumn.name}</span>
            <span className="sm:hidden text-xs">Voltar</span>
          </button>
        )}
        <div className="w-px bg-border/60" />
        {nextColumn && (
          <button
            onClick={() => onMove(order.id, nextColumn.slug)}
            className="flex-1 py-3 px-2 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors active:bg-muted/60"
            style={{ color: nextColumn.color }}
          >
            <span className="hidden sm:inline">{nextColumn.name}</span>
            <span className="sm:hidden text-xs">Avançar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// DESKTOP ORDER CARD
interface DesktopOrderCardProps {
  order: KanbanOrder
  columns: OrderStatusColumn[]
  onMove: (orderId: string, status: string) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

function DesktopOrderCard({ order, columns, onMove, onDragStart, onDragEnd }: DesktopOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const availableMoves = columns.filter(c => c.slug !== order.current_status_slug)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart?.()
    e.dataTransfer.setData('orderId', order.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd?.()
  }

  // Cores por método de pagamento
  const paymentColors: Record<string, string> = {
    credit_card: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    debit_card: 'bg-green-500/10 text-green-600 border-green-500/20',
    pix: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    cash: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    wallet: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  }

  const paymentLabels: Record<string, string> = {
    credit_card: 'Cartão',
    debit_card: 'Débito',
    pix: 'PIX',
    cash: 'Dinheiro',
    wallet: 'Carteira',
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div 
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileHover={{ y: -2, scale: 1.01 }}
          className={`
            group relative bg-gradient-to-br from-background to-muted/30 
            rounded-xl border border-border/60 p-3 cursor-move 
            hover:shadow-xl hover:border-primary/30 hover:shadow-primary/5
            transition-all duration-300 ease-out
            ${isDragging ? 'opacity-40 scale-95 rotate-2' : ''}
          `}
        >
          {/* Indicador de status no topo */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 rounded-t-xl opacity-60"
            style={{ backgroundColor: order.status_color }}
          />
          
          {/* Header do card */}
          <div className="flex items-start justify-between gap-2 pt-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Hash className="w-3 h-3 text-muted-foreground" />
                <p className="font-bold text-foreground text-xs tracking-wide">
                  {order.id.slice(-6).toUpperCase()}
                </p>
              </div>
              <p className="font-semibold text-foreground text-sm truncate leading-tight">
                {order.customer_name}
              </p>
            </div>
            
            {/* Badge de pagamento */}
            <Badge 
              variant="outline"
              className={`text-[9px] px-1.5 py-0 h-4 border ${
                paymentColors[order.payment_method] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'
              }`}
            >
              {paymentLabels[order.payment_method] || order.payment_method}
            </Badge>
          </div>

          {/* Informações do pedido */}
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDateTime(order.created_at).split(' ')[0]}</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              <span>{order.items?.length || 0} itens</span>
            </div>
          </div>

          {/* Valor destacado */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold text-[#FF8C00] tracking-tight">
              R$ {formatPrice(order.total_amount)}
            </p>
            {order.payment_status === 'paid' && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <CheckCircle className="w-3 h-3" />
                Pago
              </div>
            )}
          </div>

          {/* Preview dos itens */}
          <div className="mt-2 pt-2 border-t border-border/40">
            <p className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed">
              {order.items?.slice(0, 2).map((item, idx) => (
                <span key={item.product_name}>
                  {idx > 0 && <span className="text-border mx-1">•</span>}
                  <span className="font-medium text-foreground/70">{item.quantity}x</span>{' '}
                  <span className="truncate">{item.product_name}</span>
                </span>
              ))}
              {(order.items?.length || 0) > 2 && (
                <span className="text-muted-foreground/50 ml-1">+{(order.items?.length || 0) - 2}</span>
              )}
            </p>
          </div>

        </motion.div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Pedido #{order.id.slice(-6)}
            <Badge style={{ backgroundColor: order.status_color }}>
              {order.current_status_name}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Clique em uma ação abaixo para mover o pedido
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Ações Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableMoves.map(col => (
              <Button
                key={col.id}
                variant="outline"
                onClick={() => onMove(order.id, col.slug)}
                className="flex flex-col items-center py-3 h-auto gap-1"
                style={{ borderColor: col.color }}
              >
                <div style={{ color: col.color }}>
                  {statusIcons[col.slug]}
                </div>
                <span className="text-xs font-medium">{col.name}</span>
              </Button>
            ))}
          </div>

          {/* Cliente */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Cliente
            </h4>
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Phone className="w-4 h-4" />
              {order.customer_phone}
            </p>
          </div>

          {/* Endereço */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Endereço de Entrega
            </h4>
            <p className="text-sm">
              {order.delivery_address || 'Retirada na loja'}
            </p>
          </div>

          {/* Itens */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3">Itens do Pedido</h4>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span className="text-muted-foreground">
                    R$ {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pagamento */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4" />
              {order.payment_method === 'credit_card' && 'Cartão de Crédito'}
              {order.payment_method === 'debit_card' && 'Cartão de Débito'}
              {order.payment_method === 'pix' && 'PIX'}
              {order.payment_method === 'cash' && 'Dinheiro'}
              {order.payment_method === 'wallet' && 'Carteira'}
            </div>
            <p className="text-2xl font-bold text-[#FF8C00]">
              R$ {formatPrice(order.total_amount)}
            </p>
          </div>

          {/* Histórico */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="pt-3 border-t border-border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico de Movimentação
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                {order.status_history.slice(0, 5).map((hist, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                    <span>{hist.from_status} → {hist.to_status}</span>
                    <span className="text-muted-foreground/60">
                      ({formatDateTime(hist.moved_at)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ORDER DETAIL (Mobile Sheet)
interface OrderDetailProps {
  order: KanbanOrder
  columns: OrderStatusColumn[]
  onMove: (status: string) => void
  onClose: () => void
}

function OrderDetail({ order, columns, onMove, onClose }: OrderDetailProps) {
  const currentIndex = statusFlow.indexOf(order.current_status_slug)
  const prevStatus = currentIndex > 0 ? statusFlow[currentIndex - 1] : null
  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null
  
  const prevColumn = prevStatus ? columns.find(c => c.slug === prevStatus) : null
  const nextColumn = nextStatus ? columns.find(c => c.slug === nextStatus) : null

  return (
    <div className="h-full flex flex-col">
      <SheetHeader className="pb-4 border-b border-border">
        <SheetTitle className="flex items-center gap-2 text-lg">
          Pedido #{order.id.slice(-6)}
          <Badge style={{ backgroundColor: order.status_color }}>
            {order.current_status_name}
          </Badge>
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2 px-4">
          {prevColumn && (
            <Button
              variant="outline"
              onClick={() => onMove(prevColumn.slug)}
              className="flex-1 flex items-center gap-2 py-6"
              style={{ borderColor: prevColumn.color }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: prevColumn.color }} />
              <span style={{ color: prevColumn.color }}>{prevColumn.name}</span>
            </Button>
          )}
          {nextColumn && (
            <Button
              variant="outline"
              onClick={() => onMove(nextColumn.slug)}
              className="flex-1 flex items-center gap-2 py-6"
              style={{ borderColor: nextColumn.color }}
            >
              <span style={{ color: nextColumn.color }}>{nextColumn.name}</span>
              <ChevronRight className="w-5 h-5" style={{ color: nextColumn.color }} />
            </Button>
          )}
        </div>

        {/* Outras Ações */}
        <div className="px-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Mover para:</p>
          <div className="flex flex-wrap gap-2">
            {columns
              .filter(c => c.slug !== order.current_status_slug && c.slug !== 'cancelado')
              .map(col => (
                <Button
                  key={col.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onMove(col.slug)}
                  className="text-xs"
                  style={{ borderColor: col.color }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: col.color }}
                  />
                  {col.name}
                </Button>
              ))}
          </div>
        </div>

        {/* Cliente */}
        <div className="mx-4 bg-muted rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Cliente
          </h4>
          <p className="font-medium">{order.customer_name}</p>
          <a 
            href={`tel:${order.customer_phone}`}
            className="text-sm text-[#FF8C00] flex items-center gap-1 mt-1"
          >
            <Phone className="w-4 h-4" />
            {order.customer_phone}
          </a>
        </div>

        {/* Endereço */}
        <div className="mx-4 bg-muted rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Endereço
          </h4>
          <p className="text-sm">
            {order.delivery_address || 'Retirada na loja'}
          </p>
        </div>

        {/* Itens */}
        <div className="mx-4 bg-muted rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-3">Itens do Pedido</h4>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.product_name}</span>
                <span className="text-muted-foreground">
                  R$ {formatPrice(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagamento */}
        <div className="mx-4 flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4" />
            {order.payment_method === 'credit_card' && 'Cartão de Crédito'}
            {order.payment_method === 'debit_card' && 'Cartão de Débito'}
            {order.payment_method === 'pix' && 'PIX'}
            {order.payment_method === 'cash' && 'Dinheiro'}
            {order.payment_method === 'wallet' && 'Carteira'}
          </div>
          <p className="text-xl font-bold text-[#FF8C00]">
            R$ {formatPrice(order.total_amount)}
          </p>
        </div>

        {/* Histórico */}
        {order.status_history && order.status_history.length > 0 && (
          <div className="mx-4 pt-3 border-t border-border">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              {order.status_history.slice(0, 5).map((hist, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                  <span>{hist.from_status} → {hist.to_status}</span>
                  <span className="text-muted-foreground/60">
                    ({formatDateTime(hist.moved_at)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button onClick={onClose} variant="outline" className="w-full">
          Fechar
        </Button>
      </div>
    </div>
  )
}
