// Tipos do banco de dados Açaí da Praia

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
  base_price: number
  image_url: string | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  display_order: number
  created_at: string
  updated_at: string
  promotion_price: number | null
  base_weight_grams: number
  category?: Category
}

export interface Size {
  id: string
  name: string
  ml: number
  price_multiplier: number
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Topping {
  id: string
  name: string
  price: number
  category: string | null
  image_url: string | null
  is_active: boolean
  display_order: number
  max_quantity: number | null
  weight_grams: number
  created_at: string
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
  size_id: string | null
  size_name: string | null
  quantity: number
  unit_price: number
  total_price: number
  notes: string | null
  created_at: string
  toppings?: OrderItemTopping[]
}

export interface OrderItemTopping {
  id: string
  order_item_id: string
  topping_id: string | null
  topping_name: string
  price: number
  quantity: number
  created_at: string
}

export interface Combo {
  id: string
  name: string
  slug: string
  description: string | null
  original_price: number
  promo_price: number
  image_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  items?: ComboItem[]
}

export interface ComboItem {
  id: string
  combo_id: string
  product_id: string | null
  size_id: string | null
  quantity: number
  created_at: string
  product?: Product
  size?: Size
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

export interface Bowl {
  id: string
  name: string
  description: string | null
  ml: number
  max_weight: number | null
  price_addition: number
  image_url: string | null
  bowl_type: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

export interface AcaiType {
  id: string
  name: string
  description: string | null
  price_addition: number
  weight_addition: number
  image_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

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
  product: Product
  size: Size
  toppings: Topping[]
  quantity: number
  notes: string
  unitPrice: number
  totalPrice: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  coupon: Coupon | null
}
