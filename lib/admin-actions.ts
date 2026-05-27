'use server'

import { createClient } from '@/lib/supabase/server'
import type { Product, Category, Size, Topping, Combo, Order, Coupon, DeliveryArea, BusinessHour } from '@/lib/types'

// Verificar se usuário é admin
async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Não autenticado')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) throw new Error('Acesso negado')
  
  return user
}

// ============ DASHBOARD ============
export async function getDashboardStats() {
  await checkAdmin()
  const supabase = await createClient()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  // Pedidos de hoje
  const { count: todayOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
  
  // Faturamento de hoje
  const { data: todayRevenue } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', today.toISOString())
    .in('status', ['confirmado', 'preparando', 'saiu_entrega', 'entregue'])
  
  // Faturamento do mês
  const { data: monthRevenue } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', startOfMonth.toISOString())
    .in('status', ['confirmado', 'preparando', 'saiu_entrega', 'entregue'])
  
  // Pedidos pendentes
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pendente', 'confirmado', 'preparando'])
  
  // Total de clientes
  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_admin', false)
  
  return {
    todayOrders: todayOrders || 0,
    todayRevenue: todayRevenue?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
    monthRevenue: monthRevenue?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
    pendingOrders: pendingOrders || 0,
    totalCustomers: totalCustomers || 0
  }
}

// ============ PEDIDOS ============
export async function getAllOrders(filters?: {
  status?: string
  startDate?: string
  endDate?: string
  limit?: number
}): Promise<Order[]> {
  await checkAdmin()
  const supabase = await createClient()
  
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        toppings:order_item_toppings(*)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  await checkAdmin()
  const supabase = await createClient()
  
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString()
  }
  
  if (status === 'entregue') {
    updateData.delivered_at = new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ PRODUTOS ============
export async function getAllProducts(): Promise<Product[]> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('display_order')
  
  if (error) throw error
  return data || []
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .update({
      ...product,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============ CATEGORIAS ============
export async function getAllCategories(): Promise<Category[]> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  
  if (error) throw error
  return data || []
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .update({
      ...category,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ TOPPINGS ============
export async function getAllToppings(): Promise<Topping[]> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('toppings')
    .select('*')
    .order('display_order')
  
  if (error) throw error
  return data || []
}

export async function createTopping(topping: Omit<Topping, 'id' | 'created_at'>): Promise<Topping> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('toppings')
    .insert(topping)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTopping(id: string, topping: Partial<Topping>): Promise<Topping> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('toppings')
    .update(topping)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ TAMANHOS ============
export async function getAllSizes(): Promise<Size[]> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sizes')
    .select('*')
    .order('display_order')
  
  if (error) throw error
  return data || []
}

export async function updateSize(id: string, size: Partial<Size>): Promise<Size> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sizes')
    .update(size)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ COMBOS ============
export async function getAllCombos(): Promise<Combo[]> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('combos')
    .select('*')
    .order('display_order')
  
  if (error) throw error
  return data || []
}

export async function createCombo(combo: Omit<Combo, 'id' | 'created_at' | 'updated_at'>): Promise<Combo> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('combos')
    .insert(combo)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCombo(id: string, combo: Partial<Combo>): Promise<Combo> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('combos')
    .update({
      ...combo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ CUPONS ============
export async function getAllCoupons(): Promise<Coupon[]> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'uses_count' | 'created_at'>): Promise<Coupon> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('coupons')
    .insert(coupon)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCoupon(id: string, coupon: Partial<Coupon>): Promise<Coupon> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('coupons')
    .update(coupon)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ ÁREAS DE ENTREGA ============
export async function getAllDeliveryAreas(): Promise<DeliveryArea[]> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('delivery_areas')
    .select('*')
    .order('neighborhood')
  
  if (error) throw error
  return data || []
}

export async function createDeliveryArea(area: Omit<DeliveryArea, 'id' | 'created_at'>): Promise<DeliveryArea> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('delivery_areas')
    .insert(area)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateDeliveryArea(id: string, area: Partial<DeliveryArea>): Promise<DeliveryArea> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('delivery_areas')
    .update(area)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ HORÁRIOS ============
export async function getAllBusinessHours(): Promise<BusinessHour[]> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('day_of_week')
  
  if (error) throw error
  return data || []
}

export async function updateBusinessHour(id: string, hour: Partial<BusinessHour>): Promise<BusinessHour> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('business_hours')
    .update(hour)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ CONFIGURAÇÕES ============
export async function updateStoreSetting(key: string, value: string): Promise<void> {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('store_settings')
    .update({ 
      value,
      updated_at: new Date().toISOString()
    })
    .eq('key', key)
  
  if (error) throw error
}

export async function updateStoreSettings(settings: Record<string, string>): Promise<void> {
  await checkAdmin()
  const supabase = await createClient()
  
  for (const [key, value] of Object.entries(settings)) {
    const { error } = await supabase
      .from('store_settings')
      .upsert({ 
        key,
        value,
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
  }
}
