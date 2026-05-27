"use client"

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Helper para formatar preço de forma segura
const formatPrice = (price: any): string => {
  if (price === null || price === undefined || price === '') {
    return '0,00'
  }
  const num = typeof price === 'string' ? parseFloat(price) : Number(price)
  if (isNaN(num)) {
    return '0,00'
  }
  return num.toFixed(2).replace('.', ',')
}

export function CartSidebar() {
  const { items, removeItem, updateQuantity, totalPrice, isOpen, setIsOpen, clearCart } = useCart()

  const handleWhatsApp = () => {
    const message = items.map(item => {
      let text = `*${item.name}* (${item.quantity}x)\n`
      if (item.size) text += `  Tamanho: ${item.size}\n`
      if (item.acaiType) text += `  Tipo: ${item.acaiType}\n`
      if (item.toppings.length > 0) {
        text += `  Adicionais: ${item.toppings.map(t => t.name).join(', ')}\n`
      }
      if (item.sauces.length > 0) {
        text += `  Coberturas: ${item.sauces.map(s => s.name).join(', ')}\n`
      }
      if (item.notes) text += `  Obs: ${item.notes}\n`
      text += `  Valor: R$ ${(item.totalPrice * item.quantity).toFixed(2).replace('.', ',')}`
      return text
    }).join('\n\n')

    const total = `\n\n*TOTAL: R$ ${totalPrice.toFixed(2).replace('.', ',')}*`
    const fullMessage = encodeURIComponent(`🍇 *PEDIDO AÇAÍ DA PRAIA*\n\n${message}${total}`)
    window.open(`https://wa.me/5588999999999?text=${fullMessage}`, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-[#FF8C00]" />
                <h2 className="text-xl font-bold text-foreground">Meu Pedido</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-2">Seu carrinho está vazio</p>
                  <p className="text-muted-foreground/60 text-sm">Adicione produtos para continuar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-muted rounded-xl p-4 border border-border"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-foreground font-semibold truncate">{item.name}</h3>
                          {item.size && (
                            <p className="text-muted-foreground text-xs">{item.size}</p>
                          )}
                          {item.toppings.length > 0 && (
                            <p className="text-muted-foreground/70 text-xs truncate">
                              + {item.toppings.map(t => t.name).join(', ')}
                            </p>
                          )}
                          <p className="text-[#00BFFF] font-bold mt-1">
                            R$ {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-foreground font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between text-foreground">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-xl">
                    R$ {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleWhatsApp}
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-full"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-[#FF8C00] hover:bg-[#FFC300] text-white font-bold py-3 rounded-full">
                      Finalizar
                    </Button>
                  </Link>
                </div>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  Limpar carrinho
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
