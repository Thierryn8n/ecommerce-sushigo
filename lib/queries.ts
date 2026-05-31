"use server"

import { createClient } from '@/lib/supabase/server'

// Buscar categorias ativas
export async function getCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Erro ao buscar categorias:', error)
    return []
  }
  return data || []
}

// Buscar produtos em destaque
export async function getFeaturedProducts() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug, color)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order')
    .limit(8)

  if (error) {
    console.error('Erro ao buscar produtos em destaque:', error)
    return []
  }
  return data || []
}

// Buscar todos os produtos
export async function getProducts(categorySlug?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug, color)
    `)
    .eq('is_active', true)
    .order('display_order')

  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }
  return data || []
}

// Buscar produto por ID ou slug (com variações e itens de combo)
export async function getProduct(idOrSlug: string) {
  const supabase = await createClient()
  
  // Verifica se é um UUID válido
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
  
  // Busca o produto
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug, color)
    `)
    .eq('is_active', true)
  
  if (isUuid) {
    query = query.eq('id', idOrSlug)
  } else {
    query = query.eq('slug', idOrSlug)
  }

  const { data: product, error } = await query.single()
  
  if (error) {
    console.error('Erro ao buscar produto:', error)
    return null
  }
  
  // Se for combo, busca os itens
  if (product?.is_combo) {
    const { data: comboItems } = await supabase
      .from('combo_items')
      .select(`
        *,
        sushi_type:sushi_types(*)
      `)
      .eq('combo_product_id', product.id)
      .order('display_order')
    
    product.combo_items = comboItems || []
  }
  
  // Se tiver variações, busca as variações
  if (product?.is_variable_quantity) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('display_order')
    
    product.variants = variants || []
  }
  
  return product
}

// Buscar produtos combos ativos
export async function getCombos() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug, color)
    `)
    .eq('is_active', true)
    .eq('is_combo', true)
    .order('display_order')

  if (error) {
    console.error('Erro ao buscar combos:', error)
    return []
  }
  
  // Para cada combo, busca os itens
  const combosWithItems = await Promise.all(
    (data || []).map(async (combo) => {
      const { data: items } = await supabase
        .from('combo_items')
        .select(`
          *,
          sushi_type:sushi_types(*)
        `)
        .eq('combo_product_id', combo.id)
        .order('display_order')
      
      return { ...combo, combo_items: items || [] }
    })
  )
  
  return combosWithItems
}

// Buscar variações de um produto
export async function getProductVariants(productId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Erro ao buscar variações:', error)
    return []
  }
  return data || []
}

// Buscar tamanhos
export async function getSizes() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sizes')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Erro ao buscar tamanhos:', error)
    return []
  }
  return data || []
}

// Buscar molhos (shoyu, wasabi, gengibre)
export async function getSauces() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sauces')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Erro ao buscar molhos:', error)
    return []
  }
  return data || []
}

// Buscar tipos de sushi (Hot Roll, Uramaki, Sashimi, etc)
export async function getSushiTypes(category?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('sushi_types')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  
  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar tipos de sushi:', error)
    return []
  }
  return data || []
}

// Buscar itens de um combo específico
export async function getComboItems(comboProductId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('combo_items')
    .select(`
      *,
      sushi_type:sushi_types(*)
    `)
    .eq('combo_product_id', comboProductId)
    .order('display_order')

  if (error) {
    console.error('Erro ao buscar itens do combo:', error)
    return []
  }
  return data || []
}

// Buscar banners ativos
export async function getBanners() {
  const supabase = await createClient()
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('display_order')

  if (error) {
    console.error('Erro ao buscar banners:', error)
    return []
  }
  return data || []
}

// Buscar configurações do app
export async function getAppSettings(section?: string) {
  const supabase = await createClient()
  
  let query = supabase.from('app_settings').select('*')

  if (section) {
    query = query.eq('section', section)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar configurações:', error)
    return {}
  }

  // Converte array para objeto key-value
  const settings: Record<string, string> = {}
  data?.forEach((item) => {
    settings[`${item.section}_${item.key}`] = item.value || ''
  })
  return settings
}

// Buscar áreas de entrega
export async function getDeliveryAreas() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('delivery_areas')
    .select('*')
    .eq('is_active', true)
    .order('neighborhood')

  if (error) {
    console.error('Erro ao buscar áreas de entrega:', error)
    return []
  }
  return data || []
}

// Buscar horários de funcionamento
export async function getBusinessHours() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('day_of_week')

  if (error) {
    console.error('Erro ao buscar horários:', error)
    return []
  }
  return data || []
}

// Buscar configurações da loja
export async function getStoreSettings() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')

  if (error) {
    console.error('Erro ao buscar configurações da loja:', error)
    return {}
  }

  // Converte array para objeto key-value
  const settings: Record<string, string> = {}
  data?.forEach((item) => {
    settings[item.key] = item.value || ''
  })
  return settings
}

// Buscar cupons ativos
export async function getActiveCoupons() {
  const supabase = await createClient()
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .or(`valid_until.is.null,valid_until.gte.${now}`)

  if (error) {
    console.error('Erro ao buscar cupons:', error)
    return []
  }
  return data || []
}

// Validar cupom
export async function validateCoupon(code: string, orderTotal: number) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .or(`valid_until.is.null,valid_until.gte.${now}`)
    .single()

  if (error || !data) {
    return { valid: false, message: 'Cupom inválido ou expirado' }
  }

  if (data.min_order_value && orderTotal < parseFloat(data.min_order_value)) {
    return { 
      valid: false, 
      message: `Pedido mínimo de R$ ${parseFloat(data.min_order_value).toFixed(2).replace('.', ',')}` 
    }
  }

  if (data.max_uses && data.uses_count >= data.max_uses) {
    return { valid: false, message: 'Cupom esgotado' }
  }

  let discount = 0
  if (data.discount_type === 'percentage') {
    discount = orderTotal * (parseFloat(data.discount_value) / 100)
  } else {
    discount = parseFloat(data.discount_value)
  }

  return { 
    valid: true, 
    coupon: data, 
    discount,
    message: `Cupom aplicado! Desconto de R$ ${discount.toFixed(2).replace('.', ',')}` 
  }
}

// Buscar avaliações aprovadas de um produto
export async function getProductReviews(productId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(full_name)
    `)
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Erro ao buscar avaliações:', error)
    return []
  }
  return data || []
}
