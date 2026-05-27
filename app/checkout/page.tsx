'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, CreditCard, Banknote, QrCode, Truck, Store, MessageCircle, Check, Loader2, Package } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/contexts/cart-context'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

const DELIVERY_FEE = 5.00

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { toast } = useToast()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('pix')
  const [change, setChange] = useState('')
  
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
  })

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
  })

  const finalTotal = deliveryType === 'delivery' ? totalPrice + DELIVERY_FEE : totalPrice

  // Gerar mensagem do WhatsApp
  const getWhatsAppMessage = useCallback(() => {
    const itemsList = items.map(item => {
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
      text += `  Valor: R$ ${((item.totalPrice || 0) * item.quantity).toFixed(2).replace('.', ',')}`
      return text
    }).join('\n\n')

    const deliveryInfo = deliveryType === 'delivery'
      ? `\n\n*ENTREGA*\n${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}\n${address.neighborhood} - ${address.city}\nCEP: ${address.cep}`
      : '\n\n*RETIRADA NO LOCAL*'

    const paymentInfo = `\n\n*PAGAMENTO*\n${
      paymentMethod === 'pix' ? 'PIX' :
      paymentMethod === 'card' ? 'Cartão' :
      `Dinheiro${change ? ` - Troco para R$ ${change}` : ''}`
    }`

    const customerInfo = `\n\n*CLIENTE*\n${customer.name}\n${customer.phone}`

    const total = `\n\n*SUBTOTAL:* R$ ${totalPrice.toFixed(2).replace('.', ',')}`
    const delivery = deliveryType === 'delivery' ? `\n*ENTREGA:* R$ ${DELIVERY_FEE.toFixed(2).replace('.', ',')}` : ''
    const finalTotalText = `\n*TOTAL:* R$ ${finalTotal.toFixed(2).replace('.', ',')}`

    return encodeURIComponent(
      `*PEDIDO AÇAÍ DA PRAIA*\n\n${itemsList}${customerInfo}${deliveryInfo}${paymentInfo}${total}${delivery}${finalTotalText}`
    )
  }, [items, address, deliveryType, paymentMethod, change, customer, totalPrice, finalTotal])

  // Enviar WhatsApp e salvar pedido no banco
  const handleWhatsAppOrder = async () => {
    if (!customer.name || !customer.phone) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha seu nome e telefone para continuar',
        variant: 'destructive'
      })
      return
    }

    if (deliveryType === 'delivery' && (!address.street || !address.number)) {
      toast({
        title: 'Endereço incompleto',
        description: 'Preencha o endereço de entrega',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Buscar usuário logado
      const { data: { user } } = await supabase.auth.getUser()

      // Criar pedido no banco
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: user?.email || null,
          delivery_address: deliveryType === 'delivery'
            ? `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''} - ${address.neighborhood}, ${address.city} - CEP: ${address.cep}`
            : 'Retirada na loja',
          delivery_fee: deliveryType === 'delivery' ? DELIVERY_FEE : 0,
          subtotal: totalPrice,
          total: finalTotal,
          payment_method: paymentMethod,
          payment_status: 'pendente',
          status: 'pendente',
          notes: ''
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Criar itens do pedido
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        size_name: item.size || 'Padrão',
        quantity: item.quantity,
        unit_price: item.totalPrice || 0,
        total_price: (item.totalPrice || 0) * item.quantity,
        toppings: item.toppings,
        sauces: item.sauces
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Limpar carrinho
      clearCart()

      toast({
        title: 'Pedido salvo!',
        description: 'Redirecionando para WhatsApp...',
      })

      // Abrir WhatsApp com os dados
      const fullMessage = getWhatsAppMessage()
      window.open(`https://wa.me/5588999999999?text=${fullMessage}`, '_blank')

      // Redirecionar para página de acompanhamento
      router.push(`/pedido/${orderData.id}/acompanhamento`)
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o pedido. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Finalizar pedido e salvar no banco
  const handleFinalizeOrder = async () => {
    if (!customer.name || !customer.phone) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha seu nome e telefone para continuar',
        variant: 'destructive'
      })
      return
    }

    if (deliveryType === 'delivery' && (!address.street || !address.number)) {
      toast({
        title: 'Endereço incompleto',
        description: 'Preencha o endereço de entrega',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Buscar usuário logado ou criar um guest
      const { data: { user } } = await supabase.auth.getUser()

      // Criar pedido
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: user?.email || null,
          delivery_address: deliveryType === 'delivery' 
            ? `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''} - ${address.neighborhood}, ${address.city} - CEP: ${address.cep}`
            : 'Retirada na loja',
          delivery_fee: deliveryType === 'delivery' ? DELIVERY_FEE : 0,
          subtotal: totalPrice,
          total: finalTotal,
          payment_method: paymentMethod,
          payment_status: 'pendente',
          status: 'pendente',
          notes: ''
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Criar itens do pedido
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        size_name: item.size || 'Padrão',
        quantity: item.quantity,
        unit_price: item.totalPrice || 0,
        total_price: (item.totalPrice || 0) * item.quantity,
        toppings: item.toppings,
        sauces: item.sauces
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Limpar carrinho
      clearCart()

      toast({
        title: 'Pedido realizado!',
        description: 'Seu pedido foi enviado com sucesso',
      })

      // Redirecionar para página de acompanhamento
      router.push(`/pedido/${orderData.id}/acompanhamento`)
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar o pedido. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Seu carrinho está vazio</h1>
            <p className="text-foreground/70 mb-8">Adicione produtos para continuar</p>
            <Link href="/cardapio">
              <Button className="bg-[#FF8C00] hover:bg-[#FFC300]">
                Ver Cardápio
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-28 pb-12">
        <div className="container mx-auto px-4">
          <Link href="/cardapio" className="inline-flex items-center text-foreground/70 hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continuar Comprando
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar Pedido</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="order-2 lg:order-1 lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Step 1: Customer Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-4 sm:p-6 border border-border"
              >
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF8C00] flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
                  Seus Dados
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-foreground/70 text-sm mb-2 block">Nome completo</label>
                    <Input
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Seu nome"
                      className="bg-muted border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-foreground/70 text-sm mb-2 block">WhatsApp</label>
                    <Input
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="bg-muted border-border text-foreground"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Step 2: Delivery Type */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-4 sm:p-6 border border-border"
              >
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF8C00] flex items-center justify-center text-xs sm:text-sm font-bold">2</span>
                  Tipo de Entrega
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 sm:gap-4 ${
                      deliveryType === 'delivery'
                        ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                        : 'border-border hover:border-[#8A2BE2]/50'
                    }`}
                  >
                    <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF8C00]" />
                    <div className="text-left">
                      <p className="text-foreground font-semibold text-sm sm:text-base">Entrega</p>
                      <p className="text-foreground/50 text-xs sm:text-sm">+R$ {DELIVERY_FEE.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 sm:gap-4 ${
                      deliveryType === 'pickup'
                        ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                        : 'border-border hover:border-[#8A2BE2]/50'
                    }`}
                  >
                    <Store className="w-6 h-6 sm:w-8 sm:h-8 text-[#8A2BE2]" />
                    <div className="text-left">
                      <p className="text-foreground font-semibold text-sm sm:text-base">Retirar no Local</p>
                      <p className="text-foreground/50 text-xs sm:text-sm">Grátis</p>
                    </div>
                  </button>
                </div>

                {/* Address Form */}
                {deliveryType === 'delivery' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="text-foreground/70 text-sm mb-1 sm:mb-2 block">CEP</label>
                        <Input
                          value={address.cep}
                          onChange={(e) => setAddress({ ...address, cep: e.target.value })}
                          placeholder="00000-000"
                          className="bg-muted border-border text-foreground"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-foreground/70 text-sm mb-1 sm:mb-2 block">Rua</label>
                        <Input
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          placeholder="Nome da rua"
                          className="bg-muted border-border text-foreground"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="text-foreground/70 text-sm mb-2 block">Número</label>
                        <Input
                          value={address.number}
                          onChange={(e) => setAddress({ ...address, number: e.target.value })}
                          placeholder="000"
                          className="bg-muted border-border text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-foreground/70 text-sm mb-2 block">Complemento</label>
                        <Input
                          value={address.complement}
                          onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                          placeholder="Apto, bloco..."
                          className="bg-muted border-border text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-foreground/70 text-sm mb-2 block">Bairro</label>
                        <Input
                          value={address.neighborhood}
                          onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                          placeholder="Bairro"
                          className="bg-muted border-border text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm mb-1 sm:mb-2 block">Cidade</label>
                      <Input
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="Sua cidade"
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Step 3: Payment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-4 sm:p-6 border border-border"
              >
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF8C00] flex items-center justify-center text-xs sm:text-sm font-bold">3</span>
                  Forma de Pagamento
                </h2>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                        : 'border-border hover:border-[#8A2BE2]/50'
                    }`}
                  >
                    <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-[#00BFFF] mx-auto mb-1 sm:mb-2" />
                    <p className="text-foreground font-semibold text-center text-xs sm:text-sm">PIX</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                        : 'border-border hover:border-[#8A2BE2]/50'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-[#8A2BE2] mx-auto mb-1 sm:mb-2" />
                    <p className="text-foreground font-semibold text-center text-xs sm:text-sm">Cartão</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                        : 'border-border hover:border-[#8A2BE2]/50'
                    }`}
                  >
                    <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FF7F] mx-auto mb-1 sm:mb-2" />
                    <p className="text-foreground font-semibold text-center text-xs sm:text-sm">Dinheiro</p>
                  </button>
                </div>

                {paymentMethod === 'cash' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <label className="text-foreground/70 text-sm mb-2 block">Troco para quanto?</label>
                    <Input
                      value={change}
                      onChange={(e) => setChange(e.target.value)}
                      placeholder="R$ 0,00"
                      className="bg-muted border-border text-foreground max-w-xs"
                    />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="order-1 lg:order-2">
              <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border lg:sticky lg:top-28">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Resumo do Pedido</h2>

                <div className="space-y-3 mb-6 max-h-[40vh] lg:max-h-none overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium text-sm truncate">{item.name}</p>
                        <p className="text-foreground/50 text-xs">{item.quantity}x R$ {Number(item.totalPrice || 0).toFixed(2).replace('.', ',')}</p>
                      </div>
                      <p className="text-foreground font-semibold text-sm">
                        R$ {((item.totalPrice || 0) * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-foreground/70">
                    <span>Subtotal</span>
                    <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {deliveryType === 'delivery' && (
                    <div className="flex justify-between text-foreground/70">
                      <span>Entrega</span>
                      <span>R$ {DELIVERY_FEE.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-foreground font-bold text-xl pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-[#00BFFF]">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 space-y-3">
                  {/* Botão Principal: Finalizar Pedido */}
                  <Button
                    onClick={handleFinalizeOrder}
                    disabled={isSubmitting}
                    className="w-full bg-[#FF8C00] hover:bg-[#FFC300] text-white font-bold py-3 sm:py-4 rounded-full text-base sm:text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Finalizando...
                      </>
                    ) : (
                      <>
                        <Package className="w-5 h-5 mr-2" />
                        Finalizar Pedido
                      </>
                    )}
                  </Button>

                  {/* Botão Secundário: Enviar WhatsApp */}
                  <Button
                    onClick={handleWhatsAppOrder}
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-semibold py-3 rounded-full"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Enviar WhatsApp
                  </Button>

                  <p className="text-xs text-center text-foreground/50">
                    Ao finalizar, você será redirecionado para acompanhamento em tempo real
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar />
    </main>
  )
}
