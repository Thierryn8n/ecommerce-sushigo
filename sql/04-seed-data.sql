-- =====================================================
-- 04-SEED-DATA.SQL - Dados Iniciais SushiGo
-- =====================================================
-- Compativel com: PostgreSQL, Supabase, Neon, Aurora
-- =====================================================

-- =====================================================
-- LOJA
-- =====================================================
INSERT INTO stores (name, slug, description, whatsapp_number, phone, email, instagram_url, facebook_url)
VALUES (
  'SushiGo Delivery',
  'sushigo',
  'O melhor sushi da cidade, com qualidade premium e entrega rapida na sua casa.',
  '(85) 99999-9999',
  '(85) 3333-3333',
  'contato@sushigo.com.br',
  'https://instagram.com/sushigo',
  'https://facebook.com/sushigo'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- =====================================================
-- CATEGORIAS
-- =====================================================
INSERT INTO categories (name, slug, description, icon_name, color, display_order) VALUES
  ('Combos', 'combos', 'Combos especiais para festas e eventos', 'package', '#D62828', 1),
  ('Sashimis', 'sashimis', 'Fatias frescas de peixe premium', 'fish', '#F77F00', 2),
  ('Niguiris', 'niguiris', 'Bolinho de arroz com peixe', 'utensils', '#FCBF49', 3),
  ('Hot & Empanados', 'hot-empanados', 'Sushis empanados e fritos', 'flame', '#EAE2B7', 4),
  ('Uramakis', 'uramakis', 'Arroz por fora, alga por dentro', 'circle', '#D62828', 5),
  ('Hossomakis', 'hossomakis', 'Rolinhos finos tradicionais', 'minus', '#F77F00', 6),
  ('Joes Especiais', 'joes-especiais', 'Nossas criacoes exclusivas', 'star', '#FCBF49', 7),
  ('Porcoes', 'porcoes', 'Porcoes e acompanhamentos', 'utensils-crossed', '#003049', 8)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order;

-- =====================================================
-- COMBOS
-- =====================================================
INSERT INTO combos (name, slug, description, pieces_count, serves_people, price, display_order) VALUES
  ('Combo 10 Pessoas', 'combo-10-pessoas', 'Combo perfeito para reunioes pequenas', 250, 10, 449.90, 1),
  ('Combo 20 Pessoas', 'combo-20-pessoas', 'Ideal para festas de aniversario', 500, 20, 849.90, 2),
  ('Combo 30 Pessoas', 'combo-30-pessoas', 'Perfeito para eventos corporativos', 750, 30, 1249.90, 3),
  ('Combo 40 Pessoas', 'combo-40-pessoas', 'O combo completo para grandes eventos', 1000, 40, 1699.90, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  pieces_count = EXCLUDED.pieces_count,
  serves_people = EXCLUDED.serves_people,
  price = EXCLUDED.price;

-- =====================================================
-- PRODUTOS
-- =====================================================
INSERT INTO products (name, slug, description, base_price, pieces_count, category_id, is_featured, display_order) VALUES
  ('Hot Roll Salmao', 'hot-roll-salmao', 'Uramaki empanado com salmao cremoso', 24.90, 10, (SELECT id FROM categories WHERE slug = 'hot-empanados'), true, 1),
  ('Uramaki Filadelfia', 'uramaki-filadelfia', 'Salmao com cream cheese', 22.90, 8, (SELECT id FROM categories WHERE slug = 'uramakis'), true, 2),
  ('Sashimi Salmao', 'sashimi-salmao', 'Fatias premium de salmao fresco', 29.90, 10, (SELECT id FROM categories WHERE slug = 'sashimis'), true, 3),
  ('Niguiri Salmao', 'niguiri-salmao', 'Bolinho de arroz com salmao', 10.90, 2, (SELECT id FROM categories WHERE slug = 'niguiris'), true, 4),
  ('Joe Salmao', 'joe-salmao', 'Nossa criacao especial com salmao', 12.90, 2, (SELECT id FROM categories WHERE slug = 'joes-especiais'), true, 5),
  ('Hossomaki Salmao', 'hossomaki-salmao', 'Rolinho fino de salmao', 15.90, 8, (SELECT id FROM categories WHERE slug = 'hossomakis'), false, 6),
  ('Hot Roll Camarao', 'hot-roll-camarao', 'Uramaki empanado com camarao', 28.90, 10, (SELECT id FROM categories WHERE slug = 'hot-empanados'), false, 7),
  ('Sashimi Atum', 'sashimi-atum', 'Fatias de atum fresco', 34.90, 10, (SELECT id FROM categories WHERE slug = 'sashimis'), false, 8)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  pieces_count = EXCLUDED.pieces_count,
  is_featured = EXCLUDED.is_featured;

-- =====================================================
-- ADICIONAIS (Molhos e Extras)
-- =====================================================
INSERT INTO product_addons (name, slug, description, price, addon_type, display_order) VALUES
  ('Shoyu', 'shoyu', 'Molho de soja tradicional', 0.00, 'sauce', 1),
  ('Tare', 'tare', 'Molho agridoce japones', 0.00, 'sauce', 2),
  ('Wasabi', 'wasabi', 'Pasta de raiz forte japonesa', 2.00, 'sauce', 3),
  ('Gengibre', 'gengibre', 'Gengibre em conserva', 2.00, 'side', 4),
  ('Cream Cheese Extra', 'cream-cheese', 'Porcao extra de cream cheese', 4.00, 'topping', 5),
  ('Salmao Extra', 'salmao-extra', 'Porcao extra de salmao', 8.00, 'topping', 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  addon_type = EXCLUDED.addon_type;

-- =====================================================
-- CONFIGURACOES DO APP/SITE
-- =====================================================
INSERT INTO app_settings (section, key, value) VALUES
  -- Hero Section
  ('hero', 'title_line1', 'O MELHOR SUSHI,'),
  ('hero', 'title_line2', 'ONDE VOCE ESTIVER.'),
  ('hero', 'subtitle', 'Peixes selecionados, ingredientes frescos'),
  ('hero', 'description', 'e o verdadeiro sabor da culinaria japonesa na sua casa.'),
  ('hero', 'cta_primary', 'PEDIR AGORA'),
  ('hero', 'cta_secondary', 'VER CARDAPIO'),
  -- Home Section
  ('home', 'categories_title', 'NOSSAS CATEGORIAS'),
  ('home', 'categories_subtitle', 'Escolha sua favorita'),
  ('home', 'combos_title', 'COMBOS PARA TODOS'),
  ('home', 'combos_description', 'Perfeitos para festas e reunioes'),
  ('home', 'products_title', 'MAIS PEDIDOS'),
  ('home', 'products_subtitle', 'Os favoritos dos clientes'),
  -- Promocoes
  ('promo', 'banner_title', 'PROMOCOES EXCLUSIVAS'),
  ('promo', 'banner_description', 'Ofertas especiais toda semana para voce aproveitar!'),
  ('promo', 'banner_cta', 'VER PROMOCOES')
ON CONFLICT (section, key) DO UPDATE SET
  value = EXCLUDED.value;
