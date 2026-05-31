-- =====================================================
-- 05-FUNCTIONS.SQL - Funcoes e Triggers
-- =====================================================
-- Compativel com: PostgreSQL, Supabase, Neon, Aurora
-- =====================================================

-- =====================================================
-- FUNCAO: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_combos_updated_at ON combos;
CREATE TRIGGER update_combos_updated_at
  BEFORE UPDATE ON combos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_addons_updated_at ON product_addons;
CREATE TRIGGER update_addons_updated_at
  BEFORE UPDATE ON product_addons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON customer_addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON customer_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_settings_updated_at ON app_settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FUNCAO: Gerar numero de pedido
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_count INTEGER;
  date_prefix VARCHAR(8);
BEGIN
  date_prefix := TO_CHAR(NOW(), 'YYYYMMDD');
  
  SELECT COUNT(*) + 1 INTO today_count
  FROM orders
  WHERE created_at::date = CURRENT_DATE;
  
  NEW.order_number := date_prefix || '-' || LPAD(today_count::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- FUNCAO: Calcular total do pedido
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
  order_subtotal DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(total_price), 0) INTO order_subtotal
  FROM order_items
  WHERE order_id = NEW.order_id;
  
  UPDATE orders
  SET 
    subtotal = order_subtotal,
    total = order_subtotal + COALESCE(delivery_fee, 0) - COALESCE(discount, 0)
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_order_total_trigger ON order_items;
CREATE TRIGGER calculate_order_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION calculate_order_total();

-- =====================================================
-- FUNCAO: Criar perfil de cliente automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customers (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar cliente quando usuario se cadastra (Supabase)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FUNCAO: Buscar produtos por categoria
-- =====================================================
CREATE OR REPLACE FUNCTION get_products_by_category(category_slug VARCHAR)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  base_price DECIMAL,
  promotion_price DECIMAL,
  image_url TEXT,
  pieces_count INTEGER,
  category_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.base_price,
    p.promotion_price,
    p.image_url,
    p.pieces_count,
    c.name as category_name
  FROM products p
  JOIN categories c ON p.category_id = c.id
  WHERE c.slug = category_slug
    AND p.is_active = true
  ORDER BY p.display_order;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCAO: Buscar pedidos do cliente
-- =====================================================
CREATE OR REPLACE FUNCTION get_customer_orders(customer_user_id UUID)
RETURNS TABLE (
  order_id UUID,
  order_number VARCHAR,
  status VARCHAR,
  total DECIMAL,
  items_count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id as order_id,
    o.order_number,
    o.status,
    o.total,
    COUNT(oi.id) as items_count,
    o.created_at
  FROM orders o
  JOIN customers c ON o.customer_id = c.id
  LEFT JOIN order_items oi ON o.id = oi.order_id
  WHERE c.user_id = customer_user_id
  GROUP BY o.id
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;
