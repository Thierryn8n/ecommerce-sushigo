'use server'

import { createClient } from '@/lib/supabase/server'
import type { 
  Product, 
  Category, 
  Combo, 
  DeliveryArea, 
  BusinessHour, 
  StoreSetting,
  Order,
  Coupon,
  Profile,
  Address
} from '@/lib/types'

// ============ PRODUTOS ============
export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('display_order')
  
  if (error) throw error
  return data || []
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order')
    .limit(4)
  
  if (error) throw error
  return data || []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .single()
  
  if (error) return null
  return data
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

// ============ CATEGORIAS ============
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  
  if (error) throw error
  return data || []
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories!inner(*)')
    .eq('is_active', true)
    .eq('category.slug', categorySlug)
    .order('display_order')
  
  if (error) throw error
  return data || []
}

// ============ COMBOS ============
export async function getCombos(): Promise<Combo[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('combos')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  
  if (error) throw error
  return data || []
}

// ============ ÁREAS DE ENTREGA ============
export async function getDeliveryAreas(): Promise<DeliveryArea[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('delivery_areas')
    .select('*')
    .eq('is_active', true)
    .order('neighborhood')
  
  if (error) throw error
  return data || []
}

export async function getDeliveryFee(neighborhood: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('delivery_areas')
    .select('delivery_fee')
    .eq('neighborhood', neighborhood)
    .eq('is_active', true)
    .single()
  
  if (error || !data) return 0
  return data.delivery_fee
}

// ============ HORÁRIOS ============
export async function getBusinessHours(): Promise<BusinessHour[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('day_of_week')
  
  if (error) throw error
  return data || []
}

export async function isStoreOpen(): Promise<boolean> {
  const supabase = await createClient()
  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentTime = now.toTimeString().slice(0, 5)
  
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .single()
  
  if (error || !data || data.is_closed) return false
  if (!data.open_time || !data.close_time) return false
  
  return currentTime >= data.open_time && currentTime <= data.close_time
}

// ============ CONFIGURAÇÕES ============
export async function getStoreSettings(): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('store_settings')
    .select('key, value')
  
  if (error) throw error
  
  return (data || []).reduce((acc, setting) => {
    acc[setting.key] = setting.value || ''
    return acc
  }, {} as Record<string, string>)
}

export async function getStoreSetting(key: string): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', key)
    .single()
  
  if (error) return null
  return data?.value || null
}

// ============ CUPONS ============
export async function validateCoupon(code: string, orderValue: number): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()
  
  if (error || !data) {
    return { valid: false, message: 'Cupom inválido ou não encontrado' }
  }
  
  // Verificar validade
  const now = new Date()
  if (data.valid_until && new Date(data.valid_until) < now) {
    return { valid: false, message: 'Cupom expirado' }
  }
  
  // Verificar valor mínimo
  if (orderValue < data.min_order_value) {
    return { valid: false, message: `Valor mínimo do pedido: R$ ${data.min_order_value.toFixed(2)}` }
  }
  
  // Verificar usos
  if (data.max_uses && data.uses_count >= data.max_uses) {
    return { valid: false, message: 'Cupom esgotado' }
  }
  
  return { valid: true, coupon: data }
}

// ============ PEDIDOS ============
export async function createOrder(orderData: {
  customer_name: string
  customer_phone: string
  customer_email?: string
  delivery_address: string
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  payment_method: string
  notes?: string
  items: Array<{
    product_id: string
    product_name: string
    variant_id?: string
    variant_name?: string
    quantity: number
    quantity_pieces?: number
    unit_price: number
    total_price: number
    notes?: string
  }>
}): Promise<Order> {
  const supabase = await createClient()
  
  // Obter usuário atual (se logado)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Criar pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id || null,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_email: orderData.customer_email,
      delivery_address: orderData.delivery_address,
      subtotal: orderData.subtotal,
      delivery_fee: orderData.delivery_fee,
      discount: orderData.discount,
      total: orderData.total,
      payment_method: orderData.payment_method,
      notes: orderData.notes,
      status: 'pendente',
      payment_status: 'pendente'
    })
    .select()
    .single()
  
  if (orderError) throw orderError
  
  // Criar itens do pedido
  for (const item of orderData.items) {
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        variant_id: item.variant_id || null,
        variant_name: item.variant_name || null,
        quantity: item.quantity,
        quantity_pieces: item.quantity_pieces || item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        notes: item.notes
      })
    
    if (itemError) throw itemError
  }
  
  return order
}

export async function getUserOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

// ============ PERFIL ============
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) return null
  return data
}

export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Usuário não autenticado')
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profile,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ ENDEREÇOS ============
export async function getUserAddresses(): Promise<Address[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createAddress(address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Usuário não autenticado')
  
  // Se for endereço padrão, remover padrão dos outros
  if (address.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }
  
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      ...address,
      user_id: user.id
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateAddress(id: string, address: Partial<Address>): Promise<Address> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Usuário não autenticado')
  
  // Se for endereço padrão, remover padrão dos outros
  if (address.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .neq('id', id)
  }
  
  const { data, error } = await supabase
    .from('addresses')
    .update({
      ...address,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteAddress(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Usuário não autenticado')
  
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) throw error
}
