'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { ShoppingBag, Clock, Check, Truck, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  order_number: number
  total: number
  status: string
  created_at: string
  estimated_delivery?: string
  customer_name: string
  delivery_address: string
}

export default function MeusPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(ordersData || [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'confirmado':
        return <Check className="h-5 w-5 text-blue-500" />
      case 'preparando':
        return <ShoppingBag className="h-5 w-5 text-purple-500" />
      case 'saiu_entrega':
        return <Truck className="h-5 w-5 text-orange-500" />
      case 'entregue':
        return <Check className="h-5 w-5 text-green-500" />
      default:
        return <ShoppingBag className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      confirmado: 'Confirmado',
      preparando: 'Preparando',
      saiu_entrega: 'Saiu para Entrega',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="container max-w-4xl px-4 py-12 text-center">
            <p className="text-foreground">Carregando pedidos...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="container max-w-4xl px-4 py-12">
          <h1 className="mb-8 text-4xl font-bold text-foreground">Meus Pedidos</h1>

          {orders.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum pedido ainda
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Que tal fazer seu primeiro pedido? Temos deliciosos combos de sushi esperando por você!
              </p>
              <Link href="/cardapio">
                <Button size="lg" className="gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Explorar Cardápio
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Pedido #{order.order_number}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {new Date(order.created_at).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium text-foreground">
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2 border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent/60" />
                      <p className="text-sm text-foreground/80">
                        {order.delivery_address || 'Retirada na loja'}
                      </p>
                    </div>
                    {order.estimated_delivery && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-accent/60" />
                        <p className="text-sm text-foreground/80">
                          Entrega estimada:{' '}
                          {new Date(order.estimated_delivery).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm text-foreground/60">Total</p>
                      <p className="text-2xl font-bold text-accent">
                        R$ {parseFloat(order.total.toString()).toFixed(2)}
                      </p>
                    </div>
                    <Link href={`/pedido/${order.id}`}>
                      <Button variant="outline">Ver Detalhes</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
