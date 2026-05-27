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

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: cartData, error } = await supabase
        .from('user_carts')
        .select('*')
        .eq('user_id', user.id)
        .gte('updated_at', thirtyDaysAgo.toISOString())
        .order('updated_at', { ascending: false })

      if (error) throw error

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: 'Faca login para restaurar', variant: 'destructive' })
        return
      }

      toast({ 
        title: 'Itens recuperados!', 
        description: `${cart.item_count} itens adicionados ao carrinho` 
      })
      
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
    
    if (diffInHours < 1) return 'Ha poucos minutos'
    if (diffInHours < 24) return `Ha ${diffInHours} horas`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Ontem'
    return `Ha ${diffInDays} dias`
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
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Carrinhos Salvos</h1>
        <p className="text-slate-500 dark:text-slate-400">Recupere itens de compras nao finalizadas</p>
      </div>

      {/* Info Alert */}
      <div className="bg-gradient-to-r from-violet-50 to-transparent dark:from-violet-500/10 dark:to-transparent border border-violet-200 dark:border-violet-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-slate-900 dark:text-white font-medium">Itens sao salvos automaticamente</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Seus carrinhos ficam salvos por 30 dias. Apos esse periodo, os itens sao removidos automaticamente.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-violet-500" />
            <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Carrinhos</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{carts.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Total de Itens</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {carts.reduce((sum, c) => sum + c.item_count, 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-green-500" />
            <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Valor Total</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            R$ {carts.reduce((sum, c) => sum + c.total_amount, 0).toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Mais Recente</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
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
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* Cart Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">
                        Carrinho de {new Date(cart.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(cart.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-violet-600 dark:text-violet-400 font-bold text-lg">
                      R$ {cart.total_amount.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{cart.item_count} itens</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-4 sm:p-5 space-y-3">
                {cart.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center gap-3 sm:gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <Image 
                          src={item.image_url} 
                          alt={item.product_name}
                          width={40}
                          height={40}
                          className="w-full h-full rounded object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-base truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-500">
                        Qtd: {item.quantity}
                        {item.toppings && item.toppings.length > 0 && (
                          <span className="ml-2">+ {item.toppings.length} complementos</span>
                        )}
                      </p>
                    </div>
                    <p className="text-violet-600 dark:text-violet-400 font-medium text-sm sm:text-base">
                      R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}
                
                {cart.items.length > 3 && (
                  <p className="text-center text-sm text-slate-500">
                    +{cart.items.length - 3} itens adicionais
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <Button
                  onClick={() => restoreCart(cart)}
                  className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restaurar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => deleteCart(cart.id)}
                  className="border-red-200 dark:border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <ShoppingCart className="w-12 sm:w-16 h-12 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">Nenhum carrinho salvo</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 px-4">Seus carrinhos abandonados aparecerao aqui</p>
          <Button 
            className="bg-violet-500 hover:bg-violet-600 text-white"
            onClick={() => window.location.href = '/cardapio'}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Explorar Cardapio
          </Button>
        </div>
      )}

      {/* Quick Actions */}
      {carts.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
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
