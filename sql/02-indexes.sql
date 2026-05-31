-- =====================================================
-- 02-INDEXES.SQL - Indices para Performance
-- =====================================================
-- Compativel com: PostgreSQL, Supabase, Neon, Aurora
-- =====================================================

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_order ON products(display_order);

-- Combos
CREATE INDEX IF NOT EXISTS idx_combos_slug ON combos(slug);
CREATE INDEX IF NOT EXISTS idx_combos_active ON combos(is_active);
CREATE INDEX IF NOT EXISTS idx_combos_featured ON combos(is_featured);

-- Product Addons
CREATE INDEX IF NOT EXISTS idx_addons_slug ON product_addons(slug);
CREATE INDEX IF NOT EXISTS idx_addons_type ON product_addons(addon_type);
CREATE INDEX IF NOT EXISTS idx_addons_active ON product_addons(is_active);

-- Promotions
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(starts_at, ends_at);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Customer Addresses
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON customer_addresses(is_default);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_combo ON order_items(combo_id);

-- App Settings
CREATE INDEX IF NOT EXISTS idx_settings_section ON app_settings(section);
CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(section, key);

-- Admin Users
CREATE INDEX IF NOT EXISTS idx_admin_user ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);
