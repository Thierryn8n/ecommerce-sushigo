-- =====================================================
-- 03-RLS-POLICIES.SQL - Row Level Security (Supabase)
-- =====================================================
-- Nota: RLS e especifico do Supabase/PostgreSQL
-- Para outros bancos, use middleware de autorizacao
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

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

-- =====================================================
-- POLICIES DE CLIENTE (Usuarios autenticados)
-- =====================================================

-- Customers - Usuario ve apenas seu proprio perfil
DROP POLICY IF EXISTS "customers_own_read" ON customers;
CREATE POLICY "customers_own_read" ON customers
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "customers_own_insert" ON customers;
CREATE POLICY "customers_own_insert" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "customers_own_update" ON customers;
CREATE POLICY "customers_own_update" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

-- Customer Addresses - Usuario ve apenas seus enderecos
DROP POLICY IF EXISTS "addresses_own_read" ON customer_addresses;
CREATE POLICY "addresses_own_read" ON customer_addresses
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "addresses_own_insert" ON customer_addresses;
CREATE POLICY "addresses_own_insert" ON customer_addresses
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "addresses_own_update" ON customer_addresses;
CREATE POLICY "addresses_own_update" ON customer_addresses
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "addresses_own_delete" ON customer_addresses;
CREATE POLICY "addresses_own_delete" ON customer_addresses
  FOR DELETE USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Orders - Usuario ve apenas seus pedidos
DROP POLICY IF EXISTS "orders_own_read" ON orders;
CREATE POLICY "orders_own_read" ON orders
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "orders_own_insert" ON orders;
CREATE POLICY "orders_own_insert" ON orders
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Order Items - Usuario ve itens dos seus pedidos
DROP POLICY IF EXISTS "order_items_own_read" ON order_items;
CREATE POLICY "order_items_own_read" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLICIES DE ADMIN (Service Role ou Admin User)
-- =====================================================

-- Funcao para verificar se usuario e admin
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
DROP POLICY IF EXISTS "admin_full_customers" ON customers;
CREATE POLICY "admin_full_customers" ON customers FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "admin_full_addresses" ON customer_addresses;
CREATE POLICY "admin_full_addresses" ON customer_addresses FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "admin_full_orders" ON orders;
CREATE POLICY "admin_full_orders" ON orders FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "admin_full_order_items" ON order_items;
CREATE POLICY "admin_full_order_items" ON order_items FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "admin_full_settings" ON app_settings;
CREATE POLICY "admin_full_settings" ON app_settings FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "admin_full_admin_users" ON admin_users;
CREATE POLICY "admin_full_admin_users" ON admin_users FOR ALL USING (is_admin());
