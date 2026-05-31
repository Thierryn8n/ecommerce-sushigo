export interface WhatsAppOrderItem {
  name: string
  quantity: number
  weightGrams?: number
  size?: string
  toppings?: string[]
  sauces?: string[]
  notes?: string
}

export interface WhatsAppOrder {
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  items: WhatsAppOrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string
  notes?: string
}

export function generateWhatsAppMessage(order: WhatsAppOrder): string {
  let message = `🥤 *PEDIDO AÇAÍ DA PRAIA*\n\n`
  
  message += `👤 *Cliente:* ${order.customerName}\n`
  message += `📱 *Telefone:* ${order.customerPhone}\n`
  if (order.customerEmail) {
    message += `📧 *Email:* ${order.customerEmail}\n`
  }
  message += `📍 *Endereço:* ${order.address}\n\n`
  
  message += `📦 *ITENS DO PEDIDO*\n`
  message += `${'─'.repeat(30)}\n`
  
  order.items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`
    message += `   Qtd: ${item.quantity}x\n`
    
    if (item.weightGrams) {
      message += `   Peso: ${item.weightGrams}g\n`
    }
    
    if (item.size) {
      message += `   Tamanho: ${item.size}\n`
    }
    
    if (item.toppings && item.toppings.length > 0) {
      message += `   Adicionais: ${item.toppings.join(', ')}\n`
    }
    
    if (item.sauces && item.sauces.length > 0) {
      message += `   Coberturas: ${item.sauces.join(', ')}\n`
    }
    
    if (item.notes) {
      message += `   Obs: ${item.notes}\n`
    }
    
    message += `\n`
  })
  
  message += `${'─'.repeat(30)}\n`
  message += `💰 *SUBTOTAL:* R$ ${order.subtotal.toFixed(2)}\n`
  message += `🚚 *TAXA DE ENTREGA:* R$ ${order.deliveryFee.toFixed(2)}\n`
  
  if (order.discount > 0) {
    message += `🎉 *DESCONTO:* -R$ ${order.discount.toFixed(2)}\n`
  }
  
  message += `💳 *TOTAL A PAGAR:* R$ ${order.total.toFixed(2)}\n\n`
  
  message += `💳 *Forma de Pagamento:* ${order.paymentMethod}\n`
  
  if (order.notes) {
    message += `\n📝 *Observações:* ${order.notes}\n`
  }
  
  message += `\n✅ *Pedido confirmado!* Aguarde o contato para confirmação.`
  
  return message
}

export function openWhatsApp(order: WhatsAppOrder): void {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5588999999999'
  const message = generateWhatsAppMessage(order)
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  
  window.open(whatsappUrl, '_blank')
}

export default { generateWhatsAppMessage, openWhatsApp }
