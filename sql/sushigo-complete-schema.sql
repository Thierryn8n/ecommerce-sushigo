-- =====================================================
-- SUSHIGO E-COMMERCE - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Compatible with: PostgreSQL, Supabase, Neon, Aurora PostgreSQL, Aurora DSQL
-- Usage: Run this script in any PostgreSQL-compatible database
-- =====================================================

-- UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS (Tipos)
-- =====================================================

-- Criar ENUMs somente se nao existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pendente', 'confirmado', 'preparando', 'saiu_entrega', 'entregue', 'cancelado');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro');
  END IF;
END $$;

-- =====================================================
-- TABLE 1: stores (Configurações da Loja)
-- =====================================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL DEFAULT 'SushiGo Delivery',
  slug VARCHAR(255) UNIQUE NOT NULL DEFAULT 'sushigo',
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  phone VARCHAR(20),
  whatsapp_number VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,
  opening_hours JSONB DEFAULT '{"monday": {"open": "11:00", "close": "23:30"}}',
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 2: categories (Categorias de Produtos)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  icon_name VARCHAR(100),
  color VARCHAR(20),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 3: products (Produtos Individuais)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  promotion_price DECIMAL(10, 2),
  image_url TEXT,
  pieces_count INTEGER DEFAULT 1,
  serves_people INTEGER DEFAULT 1,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 4: combos (Combos para Festas/Eventos)
-- =====================================================
CREATE TABLE IF NOT EXISTS combos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  pieces_count INTEGER NOT NULL,
  serves_people INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  promotion_price DECIMAL(10, 2),
  image_url TEXT,
  items JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 5: product_addons (Adicionais/Molhos)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) DEFAULT 'molho',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 6: users (Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  cpf VARCHAR(14),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 7: addresses (Endereços de Entrega)
-- =====================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50),
  street VARCHAR(200) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(100),
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10),
  reference TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- =====================================================
-- TABLE 8: orders (Pedidos)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pendente',
  payment_method payment_method,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount_value DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  delivery_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  notes TEXT,
  estimated_delivery_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- =====================================================
-- TABLE 9: order_items (Itens do Pedido)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  combo_id UUID REFERENCES combos(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =====================================================
-- TABLE 10: order_item_addons (Adicionais do Item)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_item_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES product_addons(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 11: coupons (Cupons/Promoções)
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 12: delivery_areas (Áreas de Entrega)
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood VARCHAR(100) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  estimated_time_min INTEGER,
  estimated_time_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 13: banners (Banners Promocionais)
-- =====================================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200),
  subtitle VARCHAR(200),
  description TEXT,
  image_url TEXT,
  link_url VARCHAR(500),
  button_text VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 14: business_hours (Horários de Funcionamento)
-- =====================================================
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL,
  open_time TIME WITHOUT TIME ZONE,
  close_time TIME WITHOUT TIME ZONE,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 15: app_settings (Configurações da Aplicação)
-- =====================================================
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  label VARCHAR(200),
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, key)
);

-- =====================================================
-- TABLE 16: admin_users (Administradores)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES (para melhor performance)
-- =====================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_combos_featured ON combos(is_featured);
CREATE INDEX idx_combos_active ON combos(is_active);
CREATE INDEX idx_addons_active ON product_addons(is_active);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_banners_active ON banners(is_active);

-- =====================================================
-- VIEWS (para queries comuns)
-- =====================================================
CREATE OR REPLACE VIEW products_with_category AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.description,
  p.base_price,
  p.promotion_price,
  p.image_url,
  p.pieces_count,
  p.serves_people,
  p.is_featured,
  p.display_order,
  c.name as category_name,
  c.color as category_color
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

CREATE OR REPLACE VIEW active_orders_summary AS
SELECT 
  o.id,
  o.status,
  COUNT(oi.id) as items_count,
  SUM(oi.total_price) as total,
  o.created_at,
  o.estimated_delivery_time
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status IN ('pendente', 'confirmado', 'preparando', 'saiu_entrega')
GROUP BY o.id, o.status, o.created_at, o.estimated_delivery_time;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
