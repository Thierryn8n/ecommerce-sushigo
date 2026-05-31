'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { 
  Clock, CheckCircle, ChefHat, Truck, Package, 
  MapPin, Phone, MessageCircle, Loader2, ArrowLeft,
  Sparkles, Copy, Check
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Order {
  id: string
  order_number: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  total: number
  status: string
  payment_method: string
  payment_status: string
  created_at: string
  estimated_delivery?: string
}

const statusSteps = [
  { id: 'pendente', label: 'Pedido Recebido', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  { id: 'confirmado', label: 'Confirmado', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/20' },
  { id: 'preparando', label: 'Preparando', icon: ChefHat, color: 'text-purple-500', bg: 'bg-purple-500/20' },
  { id: 'saiu_entrega', label: 'Saiu para Entrega', icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/20' },
  { id: 'entregue', label: 'Entregue', icon: Package, color: 'text-green-500', bg: 'bg-green-500/20' },
]

export default function AcompanhamentoPedidoPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const fetchOrder = useCallback(async () => {
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setOrder(orderData)
    } catch (error) {
      console.error('Erro ao carregar pedido:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id, supabase])

  // Realtime subscription
  useEffect(() => {
    fetchOrder()

    const subscription = supabase
      .channel(`order_tracking_${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${params.id}`,
        },
        (payload) => {
          setOrder(payload.new as Order)
          // Toast notification when status changes
          const newStatus = payload.new.status
          const oldStatus = payload.old?.status
          if (newStatus !== oldStatus) {
            const statusLabel = statusSteps.find(s => s.id === newStatus)?.label || newStatus
            toast({
              title: 'Status atualizado!',
              description: `Seu pedido está: ${statusLabel}`,
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchOrder, params.id, supabase, toast])

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Número copiado!' })
    }
  }

  const getCurrentStepIndex = () => {
    if (!order) return -1
    return statusSteps.findIndex(s => s.id === order.status)
  }

  const getStatusLabel = (status: string) => {
    return statusSteps.find(s => s.id === status)?.label || status
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-12">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#FF8C00] mx-auto" />
            <p className="mt-4 text-foreground/70">Carregando pedido...</p>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-12">
          <div className="container mx-auto px-4 text-center">
            <Package className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Pedido não encontrado</h1>
            <p className="text-foreground/70 mb-6">Não conseguimos localizar este pedido.</p>
            <Link href="/cardapio">
              <Button className="bg-[#FF8C00] hover:bg-[#FFC300]">
                Fazer Novo Pedido
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  const currentStep = getCurrentStepIndex()

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Thank You Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FFC300] mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Pedido Recebido!
            </h1>
            <p className="text-foreground/70 text-lg">
              Obrigado, <span className="font-semibold text-[#FF8C00]">{order.customer_name}</span>!
            </p>
            <p className="text-foreground/60 mt-2">
              Seu pedido está sendo preparado com muito carinho.
            </p>
          </motion.div>

          {/* Order Number Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border mb-6"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-foreground/60 text-sm mb-1">Número do Pedido</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-[#FF8C00]">
                    #{order.order_number}
                  </span>
                  <button
                    onClick={copyOrderNumber}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Copiar número"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-foreground/50" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/cardapio">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Novo Pedido
                  </Button>
                </Link>
                <Button
                  onClick={() => window.open(`https://wa.me/${order.customer_phone?.replace(/\D/g, '')}`, '_blank')}
                  className="bg-[#25D366] hover:bg-[#20bd5a] gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 border border-border mb-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF8C00]" />
              Acompanhamento em Tempo Real
            </h2>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />
              
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStep
                  const isCurrent = index === currentStep
                  const Icon = step.icon

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isCurrent 
                          ? 'bg-[#FF8C00]/10 border-2 border-[#FF8C00]' 
                          : isCompleted 
                            ? 'bg-green-500/10 border border-green-500/30' 
                            : 'bg-muted/50 border border-border'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrent 
                          ? 'bg-[#FF8C00] text-white' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-muted text-foreground/40'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          isCurrent 
                            ? 'text-[#FF8C00]' 
                            : isCompleted 
                              ? 'text-green-500' 
                              : 'text-foreground/40'
                        }`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-foreground/60 mt-1">
                            Status atual do seu pedido
                          </p>
                        )}
                      </div>
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-4"
          >
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#8A2BE2]" />
                Endereço de Entrega
              </h3>
              <p className="text-foreground/70">{order.delivery_address}</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#8A2BE2]" />
                Contato
              </h3>
              <p className="text-foreground/70">{order.customer_phone}</p>
              <p className="text-foreground/50 text-sm mt-1">
                Pagamento: {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'card' ? 'Cartão' : 'Dinheiro'}
              </p>
            </div>
          </motion.div>

          {/* Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-gradient-to-r from-[#FF8C00]/20 to-[#FFC300]/20 rounded-2xl p-6 border border-[#FF8C00]/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">Total do Pedido</span>
              <span className="text-3xl font-bold text-[#FF8C00]">
                R$ {order.total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </motion.div>

          {/* Real-time indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-foreground/50"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Atualizações em tempo real ativas
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
