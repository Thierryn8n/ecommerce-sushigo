// Tipos do banco de dados SushiGo

export type OrderStatus = 'pendente' | 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado'
export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  color: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  banner_url: string | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  is_promotion: boolean
  display_order: number
  created_at: string
  updated_at: string
  price: number
  // Campos específicos para sushi
  is_combo: boolean
  is_variable_quantity: boolean
  base_pieces: number
  min_quantity: number
  max_quantity: number
  sushi_type_id: string | null
  molhos_included: boolean
  category?: Category
  variants?: ProductVariant[]
  combo_items?: ComboProductItem[]
}

// Variações de produto (para produtos com quantidades variáveis como Sashimi)
export interface ProductVariant {
  id: string
  product_id: string
  variant_name: string
  quantity_value: number
  price: number
  is_default: boolean
  is_active: boolean
  display_order: number
  created_at: string
}

// Molhos para sushi (Shoyu, Wasabi, Gengibre)
export interface Sauce {
  id: string
  name: string
  description: string | null
  image_url: string | null
  is_free: boolean
  max_quantity: number
  is_active: boolean
  display_order: number
  created_at: string
}

// Tipo de sushi (Hot Roll, Uramaki, Sashimi, etc)
export interface SushiType {
  id: string
  name: string
  description: string | null
  category: 'sashimi' | 'nigiri' | 'hot' | 'uramaki' | 'hossomaki' | 'joe' | 'porcao' | 'sobremesa' | 'especial'
  pieces_per_serving: number
  is_raw: boolean
  is_fried: boolean
  image_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  cpf: string | null
  is_admin: boolean
  is_approved: boolean
  is_owner: boolean
  role: 'customer' | 'admin' | 'owner'
  store_id: string | null
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  label: string | null
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zip_code: string | null
  reference: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: number
  user_id: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  address_id: string | null
  delivery_address: string | null
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  status: OrderStatus
  payment_method: PaymentMethod | null
  payment_status: string
  notes: string | null
  estimated_delivery: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  address?: Address
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  variant_id: string | null
  variant_name: string | null
  quantity: number
  unit_price: number
  total_price: number
  notes: string | null
  created_at: string
  // Campos específicos para sushi
  quantity_pieces: number
  selected_molhos: string[]
  combo_details: ComboDetail[] | null
}

// Detalhes dos itens quando o pedido é um combo
export interface ComboDetail {
  sushi_type_id: string
  sushi_name: string
  category: string
  quantity: number
  pieces_per_serving: number
  total_pieces: number
}

// Removido - sistema antigo de toppings

// Item dentro de um combo (ex: 4 Hot Rolls no Combo Individual)
export interface ComboProductItem {
  id: string
  combo_product_id: string
  sushi_type_id: string
  quantity: number
  is_substitutable: boolean
  display_order: number
  created_at: string
  sushi_type?: SushiType
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number
  max_uses: number | null
  uses_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  created_at: string
}

export interface StoreSetting {
  id: string
  key: string
  value: string | null
  description: string | null
  updated_at: string
}

export interface BusinessHour {
  id: string
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
  created_at: string
}

export interface DeliveryArea {
  id: string
  neighborhood: string
  delivery_fee: number
  estimated_time_min: number | null
  estimated_time_max: number | null
  is_active: boolean
  created_at: string
}

// Removido - sistema antigo de vasilhas

// SushiType já definido acima

export interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  description: string | null
  image_url: string | null
  mobile_image_url: string | null
  link_url: string | null
  button_text: string | null
  display_order: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  background_color: string | null
  floating_image_url: string | null
  created_at: string
}

export interface AppSetting {
  id: string
  section: string
  key: string
  value: string | null
  label: string | null
  description: string | null
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string | null
  title: string
  message: string | null
  type: string | null
  is_read: boolean
  link_url: string | null
  created_at: string
}

export interface Review {
  id: string
  user_id: string | null
  product_id: string | null
  order_id: string | null
  rating: number
  comment: string | null
  image_url: string | null
  is_approved: boolean
  created_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

// Tipos para o carrinho
export interface CartItem {
  id: string
  productId: string
  product: Product
  variant?: ProductVariant
  quantity: number
  notes: string
  totalPrice: number
  selectedMolhos: string[]
  quantityPieces: number
  // Se for combo, guardar detalhes
  comboItems?: ComboProductItem[]
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  coupon: Coupon | null
}

// Tipo Combo (mantido para compatibilidade)
export interface Combo {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  items?: ComboProductItem[]
}
