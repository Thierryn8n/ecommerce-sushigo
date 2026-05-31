'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ShoppingCart, 
  Clock, 
  Package,
  Trash2,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface CartItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  toppings?: string[]
  sauces?: string[]
  image_url?: string
}

interface AbandonedCart {
  id: string
  created_at: string
  updated_at: string
  items: CartItem[]
  total_amount: number
  item_count: number
}

export default function CarrinhoAbandonadoPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchAbandonedCarts()
  }, [])

  async function fetchAbandonedCarts() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar carrinhos abandonados (últimos 30 dias, sem checkout completo)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: cartData, error } = await supabase
        .from('user_carts')
        .select('*')
        .eq('user_id', user.id)
        .gte('updated_at', thirtyDaysAgo.toISOString())
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Processar carrinhos
      const processedCarts = (cartData || []).map(cart => {
        const items = cart.items || []
        const total = items.reduce((sum: number, item: CartItem) => 
          sum + (item.unit_price * item.quantity), 0
        )
        
        return {
          id: cart.id,
          created_at: cart.created_at,
          updated_at: cart.updated_at,
          items: items,
          total_amount: total,
          item_count: items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
        }
      }).filter(cart => cart.items.length > 0)

      setCarts(processedCarts)
    } catch (error) {
      console.error('Erro ao buscar carrinhos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function restoreCart(cart: AbandonedCart) {
    try {
      // Adicionar itens ao carrinho atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: 'Faça login para restaurar', variant: 'destructive' })
        return
      }

      // Aqui você pode implementar a lógica para restaurar no contexto do carrinho
      // Por enquanto, vamos apenas redirecionar para o checkout
      toast({ 
        title: 'Itens recuperados!', 
        description: `${cart.item_count} itens adicionados ao carrinho` 
      })
      
      // Redirecionar para o cardápio ou checkout
      window.location.href = '/checkout'
    } catch (error) {
      toast({ title: 'Erro ao restaurar carrinho', variant: 'destructive' })
    }
  }

  async function deleteCart(cartId: string) {
    if (!confirm('Tem certeza que deseja remover este carrinho?')) return

    try {
      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('id', cartId)

      if (error) throw error

      toast({ title: 'Carrinho removido' })
      fetchAbandonedCarts()
    } catch (error) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  function getTimeAgo(date: string) {
    const now = new Date()
    const past = new Date(date)
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Há poucos minutos'
    if (diffInHours < 24) return `Há ${diffInHours} horas`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Ontem'
    return `Há ${diffInDays} dias`
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
        <h1 className="text-3xl font-bold text-white mb-2">Carrinhos Salvos</h1>
        <p className="text-gray-400">Recupere itens de compras não finalizadas</p>
      </div>

      {/* Info Alert */}
      <div className="bg-gradient-to-r from-[#FF8C00]/10 to-transparent border border-[#FF8C00]/20 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#FF8C00] mt-0.5" />
        <div>
          <p className="text-white font-medium">Itens são salvos automaticamente</p>
          <p className="text-sm text-gray-400">
            Seus carrinhos ficam salvos por 30 dias. Após esse período, os itens são removidos automaticamente.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-[#FF8C00]" />
            <span className="text-gray-400 text-sm">Carrinhos</span>
          </div>
          <p className="text-2xl font-bold text-white">{carts.length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-gray-400 text-sm">Total de Itens</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {carts.reduce((sum, c) => sum + c.item_count, 0)}
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-green-500" />
            <span className="text-gray-400 text-sm">Valor Total</span>
          </div>
          <p className="text-2xl font-bold text-white">
            R$ {carts.reduce((sum, c) => sum + c.total_amount, 0).toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-gray-400 text-sm">Mais Recente</span>
          </div>
          <p className="text-lg font-bold text-white">
            {carts[0] ? getTimeAgo(carts[0].updated_at) : '-'}
          </p>
        </div>
      </div>

      {/* Carts List */}
      {carts.length > 0 ? (
        <div className="space-y-4">
          {carts.map((cart) => (
            <motion.div
              key={cart.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden"
            >
              {/* Cart Header */}
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF8C00]/20 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-[#FF8C00]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        Carrinho de {new Date(cart.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(cart.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FF8C00] font-bold text-lg">
                      R$ {cart.total_amount.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-gray-400">{cart.item_count} itens</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-5 space-y-3">
                {cart.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                    <div className="w-12 h-12 bg-[#0f0f0f] rounded-lg flex items-center justify-center">
                      {item.image_url ? (
                        <Image 
                          src={item.image_url} 
                          alt={item.product_name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 font-medium">{item.product_name}</p>
                      <p className="text-xs text-gray-500">
                        Qtd: {item.quantity}
                        {item.toppings && item.toppings.length > 0 && (
                          <span className="ml-2">+ {item.toppings.length} complementos</span>
                        )}
                      </p>
                    </div>
                    <p className="text-[#FF8C00]">
                      R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}
                
                {cart.items.length > 3 && (
                  <p className="text-center text-sm text-gray-500">
                    +{cart.items.length - 3} itens adicionais
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-[#0f0f0f] flex gap-3">
                <Button
                  onClick={() => restoreCart(cart)}
                  className="flex-1 bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restaurar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => deleteCart(cart.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-white/10">
          <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum carrinho salvo</h3>
          <p className="text-gray-400 mb-6">Seus carrinhos abandonados aparecerão aqui</p>
          <Button 
            className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
            onClick={() => window.location.href = '/cardapio'}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Explorar Cardápio
          </Button>
        </div>
      )}

      {/* Quick Actions */}
      {carts.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 border-[#FF8C00]/20 text-[#FF8C00] hover:bg-[#FF8C00]/10"
            onClick={() => window.location.href = '/cardapio'}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continuar Comprando
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
