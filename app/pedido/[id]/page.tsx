'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  product_name: string
  size_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: number
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_address: string
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  status: string
  payment_method: string
  payment_status: string
  notes: string
  created_at: string
  estimated_delivery?: string
}

export default function PedidoPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadOrder()
  }, [])

  async function loadOrder() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (orderError) throw orderError
      setOrder(orderData)

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', params.id)

      if (itemsError) throw itemsError
      setItems(itemsData || [])
    } catch (error) {
      console.error('Erro ao carregar pedido:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="container px-4 py-12 text-center">
            <p className="text-foreground">Carregando pedido...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="container px-4 py-12 text-center">
            <p className="text-foreground">Pedido não encontrado</p>
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
          <Link href="/meus-pedidos">
            <Button variant="outline" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">
              Pedido #{order.order_number}
            </h1>
            <p className="mt-2 text-foreground/60">
              {new Date(order.created_at).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Informações do Pedido */}
            <div className="rounded-lg border border-purple-700/30 bg-purple-950/20 p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Informações do Pedido
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-foreground/60">Status</p>
                  <p className="font-semibold text-foreground capitalize">
                    {order.status === 'saiu_entrega'
                      ? 'Saiu para Entrega'
                      : order.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">
                    Forma de Pagamento
                  </p>
                  <p className="font-semibold text-foreground capitalize">
                    {order.payment_method?.replace('_', ' ') || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">
                    Status do Pagamento
                  </p>
                  <p className="font-semibold text-foreground capitalize">
                    {order.payment_status}
                  </p>
                </div>
                {order.estimated_delivery && (
                  <div>
                    <p className="text-sm text-foreground/60">
                      Entrega Estimada
                    </p>
                    <p className="font-semibold text-foreground">
                      {new Date(order.estimated_delivery).toLocaleDateString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Informações de Contato */}
            <div className="rounded-lg border border-purple-700/30 bg-purple-950/20 p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Informações de Contato
              </h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-shrink-0">
                    <p className="text-sm text-foreground/60">Nome</p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {order.customer_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent" />
                  <p className="font-semibold text-foreground">
                    {order.customer_phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />
                  <p className="text-sm text-foreground">
                    {order.customer_email}
                  </p>
                </div>
                <div className="flex items-start gap-2 pt-2">
                  <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-accent" />
                  <div>
                    <p className="text-sm text-foreground/60">Endereço</p>
                    <p className="text-foreground">{order.delivery_address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="mb-8 rounded-lg border border-purple-700/30 bg-purple-950/20 p-6">
            <h2 className="mb-4 text-xl font-bold text-foreground">
              Itens do Pedido
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-t border-purple-700/20 py-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {item.size_name} - Quantidade: {item.quantity}
                    </p>
                  </div>
                  <p className="text-right font-semibold text-accent">
                    R$ {parseFloat(item.total_price.toString()).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="rounded-lg border border-purple-700/30 bg-purple-950/20 p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-foreground/80">Subtotal:</p>
                <p className="font-semibold text-foreground">
                  R$ {parseFloat(order.subtotal.toString()).toFixed(2)}
                </p>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between">
                  <p className="text-foreground/80">Taxa de Entrega:</p>
                  <p className="font-semibold text-foreground">
                    R$ {parseFloat(order.delivery_fee.toString()).toFixed(2)}
                  </p>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <p>Desconto:</p>
                  <p className="font-semibold">
                    -R$ {parseFloat(order.discount.toString()).toFixed(2)}
                  </p>
                </div>
              )}
              <div className="border-t border-purple-700/20 pt-2">
                <div className="flex justify-between">
                  <p className="text-lg font-bold text-foreground">Total:</p>
                  <p className="text-xl font-bold text-accent">
                    R$ {parseFloat(order.total.toString()).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-8 rounded-lg border border-purple-700/30 bg-purple-950/20 p-6">
              <h3 className="mb-2 font-semibold text-foreground">Observações</h3>
              <p className="text-foreground/80">{order.notes}</p>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Link href="/meus-pedidos" className="flex-1">
              <Button variant="outline" className="w-full">
                Voltar aos Pedidos
              </Button>
            </Link>
            <Link href="/cardapio" className="flex-1">
              <Button className="w-full bg-accent hover:bg-accent/90">
                Fazer Novo Pedido
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
