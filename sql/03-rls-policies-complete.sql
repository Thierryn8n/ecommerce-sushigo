-- =====================================================
-- 03-RLS-POLICIES-COMPLETE.SQL - Para sushigo-complete-schema.sql
-- =====================================================
-- Use este arquivo se executou o sushigo-complete-schema.sql
-- (que usa tabela 'users' em vez de 'customers')
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES PUBLICAS (Leitura para todos)
-- =====================================================

-- Stores - Leitura publica
DROP POLICY IF EXISTS "stores_public_read" ON stores;
CREATE POLICY "stores_public_read" ON stores
  FOR SELECT USING (is_active = true);

-- Categories - Leitura publica
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (is_active = true);

-- Products - Leitura publica
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

-- Combos - Leitura publica
DROP POLICY IF EXISTS "combos_public_read" ON combos;
CREATE POLICY "combos_public_read" ON combos
  FOR SELECT USING (is_active = true);

-- Product Addons - Leitura publica
DROP POLICY IF EXISTS "addons_public_read" ON product_addons;
CREATE POLICY "addons_public_read" ON product_addons
  FOR SELECT USING (is_active = true);

-- Promotions - Leitura publica (ativas e dentro do periodo)
DROP POLICY IF EXISTS "promotions_public_read" ON promotions;
CREATE POLICY "promotions_public_read" ON promotions
  FOR SELECT USING (
    is_active = true 
    AND (starts_at IS NULL OR starts_at <= NOW()) 
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

-- App Settings - Leitura publica
DROP POLICY IF EXISTS "settings_public_read" ON app_settings;
CREATE POLICY "settings_public_read" ON app_settings
  FOR SELECT USING (true);

-- Banners - Leitura publica
DROP POLICY IF EXISTS "banners_public_read" ON banners;
CREATE POLICY "banners_public_read" ON banners
  FOR SELECT USING (is_active = true);

-- Business Hours - Leitura publica
DROP POLICY IF EXISTS "business_hours_public_read" ON business_hours;
CREATE POLICY "business_hours_public_read" ON business_hours
  FOR SELECT USING (true);

-- =====================================================
-- POLICIES DE CLIENTE (Usuarios autenticados)
-- =====================================================

-- Users - Usuario ve apenas seu proprio perfil
DROP POLICY IF EXISTS "users_own_read" ON users;
CREATE POLICY "users_own_read" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_own_insert" ON users;
CREATE POLICY "users_own_insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_own_update" ON users;
CREATE POLICY "users_own_update" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Addresses - Usuario ve apenas seus enderecos
DROP POLICY IF EXISTS "addresses_own_read" ON addresses;
CREATE POLICY "addresses_own_read" ON addresses
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "addresses_own_insert" ON addresses;
CREATE POLICY "addresses_own_insert" ON addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "addresses_own_update" ON addresses;
CREATE POLICY "addresses_own_update" ON addresses
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "addresses_own_delete" ON addresses;
CREATE POLICY "addresses_own_delete" ON addresses
  FOR DELETE USING (user_id = auth.uid());

-- Orders - Usuario ve apenas seus pedidos
DROP POLICY IF EXISTS "orders_own_read" ON orders;
CREATE POLICY "orders_own_read" ON orders
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "orders_own_insert" ON orders;
CREATE POLICY "orders_own_insert" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Order Items - Usuario ve itens dos seus pedidos
DROP POLICY IF EXISTS "order_items_own_read" ON order_items;
CREATE POLICY "order_items_own_read" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

-- =====================================================
-- POLICIES DE ADMIN (Service Role ou Admin User)
-- =====================================================

-- Funcao para verificar se usuario e admin
DROP POLICY IF EXISTS "admin_users_read" ON admin_users;
CREATE POLICY "admin_users_read" ON admin_users FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin pode fazer tudo em todas as tabelas
DROP POLICY IF EXISTS "admin_full_stores" ON stores;
CREATE POLICY "admin_full_stores" ON stores FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_categories" ON categories;
CREATE POLICY "admin_full_categories" ON categories FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_products" ON products;
CREATE POLICY "admin_full_products" ON products FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_combos" ON combos;
CREATE POLICY "admin_full_combos" ON combos FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_addons" ON product_addons;
CREATE POLICY "admin_full_addons" ON product_addons FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_promotions" ON promotions;
CREATE POLICY "admin_full_promotions" ON promotions FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_users" ON users;
CREATE POLICY "admin_full_users" ON users FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_addresses" ON addresses;
CREATE POLICY "admin_full_addresses" ON addresses FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_orders" ON orders;
CREATE POLICY "admin_full_orders" ON orders FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_order_items" ON order_items;
CREATE POLICY "admin_full_order_items" ON order_items FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_settings" ON app_settings;
CREATE POLICY "admin_full_settings" ON app_settings FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_admin_users" ON admin_users;
CREATE POLICY "admin_full_admin_users" ON admin_users FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_banners" ON banners;
CREATE POLICY "admin_full_banners" ON banners FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_full_business_hours" ON business_hours;
CREATE POLICY "admin_full_business_hours" ON business_hours FOR ALL USING (is_admin());
