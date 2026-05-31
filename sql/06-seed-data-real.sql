-- =====================================================
-- 06-SEED-DATA-REAL.SQL - Dados Reais Baseados nas Imagens
-- =====================================================
-- Execute após criar as tabelas (sushigo-complete-schema.sql)
-- =====================================================

-- =====================================================
-- 1. CATEGORIAS (8 categorias da imagem)
-- =====================================================
INSERT INTO categories (id, name, slug, description, icon_name, color, display_order, is_active) VALUES
(gen_random_uuid(), 'Combos', 'combos', 'Combinados especiais para grupos', 'Package', '#D62828', 1, true),
(gen_random_uuid(), 'Sashimis', 'sashimis', 'Peixes frescos fatiados', 'Fish', '#FCBF49', 2, true),
(gen_random_uuid(), 'Niguiris', 'niguiris', 'Arroz com peixe sobreposto', 'CircleDot', '#D62828', 3, true),
(gen_random_uuid(), 'Hot & Empanados', 'hot-empanados', 'Rolls fritos e empanados', 'Flame', '#FCBF49', 4, true),
(gen_random_uuid(), 'Uramakis', 'uramakis', 'Rolls com arroz por fora', 'Roll', '#D62828', 5, true),
(gen_random_uuid(), 'Hossomakis', 'hossomakis', 'Rolls finos tradicionais', 'Cylinder', '#FCBF49', 6, true),
(gen_random_uuid(), 'Joes Especiais', 'joes-especiais', 'Criações exclusivas SushiGo', 'Star', '#D62828', 7, true),
(gen_random_uuid(), 'Porções', 'porcoes', 'Acompanhamentos e entradas', 'Utensils', '#FCBF49', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 2. PRODUTOS (Produtos reais das imagens)
-- =====================================================

-- SASHIMIS
INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'sashimis'),
  'Sashimi Salmão',
  'sashimi-salmao',
  'Salmão fresco fatiado, 10 fatias generosas. Servido com wasabi e gengibre.',
  29.90,
  10,
  1,
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sashimi-salmao');

INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'sashimis'),
  'Sashimi Mix',
  'sashimi-mix',
  'Seleção especial com salmão, atum e peixe branco. 15 fatias.',
  42.90,
  15,
  2,
  false,
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sashimi-mix');

-- NIGUIRIS
INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'niguiris'),
  'Nigiri Salmão',
  'nigiri-salmao',
  'Arroz japonês com fatia de salmão fresco. 2 unidades.',
  10.90,
  2,
  1,
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'nigiri-salmao');

INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'niguiris'),
  'Nigiri Atum',
  'nigiri-atum',
  'Arroz japonês com fatia de atum vermelho. 2 unidades.',
  12.90,
  2,
  1,
  false,
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'nigiri-atum');

-- URAMAKIS
INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'uramakis'),
  'Uramaki Filadélfia',
  'uramaki-filadelfia',
  'Salmão, cream cheese e pepino. Envolvido em arroz e alga, coberto com gergelim. 8 peças.',
  22.90,
  8,
  1,
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'uramaki-filadelfia');

INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'uramakis'),
  'Uramaki Salmão Grelhado',
  'uramaki-salmao-grelhado',
  'Salmão grelhado, cream cheese e cebolinha. 8 peças.',
  24.90,
  8,
  1,
  false,
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'uramaki-salmao-grelhado');

INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'uramakis'),
  'Uramaki Camarão',
  'uramaki-camarao',
  'Camarão empanado, cream cheese e cebolinha. 8 peças.',
  26.90,
  8,
  1,
  false,
  true,
  3
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'uramaki-camarao');

-- HOSSOMAKIS
INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'hossomakis'),
  'Hossomaki Salmão',
  'hossomaki-salmao',
  'Roll fino tradicional com salmão fresco. 8 peças.',
  18.90,
  8,
  1,
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'hossomaki-salmao');

-- HOT & EMPANADOS
INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'hot-empanados'),
  'Hot Roll Salmão',
  'hot-roll-salmao',
  'Salmão empanado, cream cheese e cebolinha. Levemente picante. 8 peças.',
  24.90,
  8,
  1,
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'hot-roll-salmao');

INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'hot-empanados'),
  'Hot Especial',
  'hot-especial',
  'Salmão e atum empanados, cream cheese e molho especial da casa. 10 peças.',
  29.90,
  10,
  2,
  true,
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'hot-especial');

INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'hot-empanados'),
  'Kani Empanado',
  'kani-empanado',
  'Kani (carne de caranguejo) empanada em 10 unidades crocantes.',
  19.90,
  10,
  2,
  false,
  true,
  3
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'kani-empanado');

-- JOES ESPECIAIS
INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'joes-especiais'),
  'Joe Salmão',
  'joe-salmao',
  'Criação exclusiva SushiGo: salmão fresco, cream cheese e cebolinha. 2 unidades.',
  12.90,
  2,
  1,
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'joe-salmao');

-- PORÇÕES
INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'porcoes'),
  'Temaki Salmão',
  'temaki-salmao',
  'Cone de alga com arroz, salmão e cream cheese. 1 unidade.',
  16.90,
  1,
  1,
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'temaki-salmao');

INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'porcoes'),
  'Guioza',
  'guioza',
  'Dumplings japoneses recheados com carne suína e legumes. 6 unidades.',
  24.90,
  6,
  2,
  true,
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'guioza');

INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'porcoes'),
  'Harumaki',
  'harumaki',
  'Rolinhos primavera crocantes. 4 unidades.',
  18.90,
  4,
  2,
  false,
  true,
  3
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'harumaki');

INSERT INTO products (id, category_id, name, slug, description, base_price, pieces_count, serves_people, is_featured, is_active, display_order) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'porcoes'),
  'Sunomono',
  'sunomono',
  'Salada refrescante de pepino com molho agridoce. Porção individual.',
  14.90,
  1,
  1,
  false,
  true,
  4
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'sunomono');

-- =====================================================
-- 3. COMBOS (Combos da imagem)
-- =====================================================
INSERT INTO combos (id, name, slug, description, pieces_count, serves_people, price, is_featured, is_active, display_order, items) VALUES
(
  gen_random_uuid(),
  'Combo 10 Pessoas',
  'combo-10-pessoas',
  'Ideal para festas e eventos. Inclui variedade de sushis, sashimis e hot rolls.',
  140,
  10,
  449.90,
  true,
  true,
  1,
  '[
    {"name": "Uramaki Filadélfia", "quantity": 20, "description": "10 de salmão, 10 de atum"},
    {"name": "Hot Roll Salmão", "quantity": 20},
    {"name": "Nigiri Salmão", "quantity": 10},
    {"name": "Sashimi Salmão", "quantity": 20, "description": "20 fatias"},
    {"name": "Hossomaki Salmão", "quantity": 20},
    {"name": "Joe Salmão", "quantity": 10},
    {"name": "Temaki Salmão", "quantity": 10},
    {"name": "Kani Empanado", "quantity": 20},
    {"name": "Harumaki", "quantity": 10}
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO combos (id, name, slug, description, pieces_count, serves_people, price, is_featured, is_active, display_order, items) VALUES
(
  gen_random_uuid(),
  'Combo 20 Pessoas',
  'combo-20-pessoas',
  'Perfeito para grandes celebrações. Variedade completa da culinária japonesa.',
  240,
  20,
  849.90,
  true,
  true,
  2,
  '[
    {"name": "Uramaki Filadélfia", "quantity": 40},
    {"name": "Hot Roll Salmão", "quantity": 30},
    {"name": "Hot Especial", "quantity": 20},
    {"name": "Nigiri Salmão", "quantity": 20},
    {"name": "Nigiri Atum", "quantity": 10},
    {"name": "Sashimi Salmão", "quantity": 30},
    {"name": "Sashimi Mix", "quantity": 20},
    {"name": "Hossomaki Salmão", "quantity": 30},
    {"name": "Joe Salmão", "quantity": 20},
    {"name": "Kani Empanado", "quantity": 30},
    {"name": "Guioza", "quantity": 20},
    {"name": "Temaki Salmão", "quantity": 20}
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO combos (id, name, slug, description, pieces_count, serves_people, price, is_featured, is_active, display_order, items) VALUES
(
  gen_random_uuid(),
  'Combo 30 Pessoas',
  'combo-30-pessoas',
  'O combo definitivo para eventos corporativos e festas grandes.',
  357,
  30,
  1249.90,
  true,
  true,
  3,
  '[
    {"name": "Uramaki Filadélfia", "quantity": 50},
    {"name": "Uramaki Camarão", "quantity": 30},
    {"name": "Hot Roll Salmão", "quantity": 40},
    {"name": "Hot Especial", "quantity": 30},
    {"name": "Nigiri Salmão", "quantity": 30},
    {"name": "Nigiri Atum", "quantity": 20},
    {"name": "Sashimi Salmão", "quantity": 40},
    {"name": "Sashimi Mix", "quantity": 30},
    {"name": "Hossomaki Salmão", "quantity": 30},
    {"name": "Joe Salmão", "quantity": 27},
    {"name": "Kani Empanado", "quantity": 40},
    {"name": "Guioza", "quantity": 30},
    {"name": "Temaki Salmão", "quantity": 30}
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO combos (id, name, slug, description, pieces_count, serves_people, price, is_featured, is_active, display_order, items) VALUES
(
  gen_random_uuid(),
  'Combo 40 Pessoas',
  'combo-40-pessoas',
  'O maior combo para mega eventos. Inclui tudo da culinária japonesa.',
  430,
  40,
  1699.90,
  true,
  true,
  4,
  '[
    {"name": "Uramaki Filadélfia", "quantity": 60},
    {"name": "Uramaki Camarão", "quantity": 40},
    {"name": "Hot Roll Salmão", "quantity": 50},
    {"name": "Hot Especial", "quantity": 40},
    {"name": "Nigiri Salmão", "quantity": 40},
    {"name": "Nigiri Atum", "quantity": 30},
    {"name": "Sashimi Salmão", "quantity": 50},
    {"name": "Sashimi Mix", "quantity": 40},
    {"name": "Hossomaki Salmão", "quantity": 40},
    {"name": "Joe Salmão", "quantity": 30},
    {"name": "Kani Empanado", "quantity": 50},
    {"name": "Guioza", "quantity": 40},
    {"name": "Temaki Salmão", "quantity": 40},
    {"name": "Harumaki", "quantity": 20}
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 4. APP SETTINGS (Configurações do App)
-- =====================================================
INSERT INTO app_settings (section, key, value, label) VALUES
('hero', 'hero_title', 'O melhor sushi, onde você estiver.', 'Título do Hero'),
('hero', 'hero_subtitle', 'O verdadeiro sabor da culinária japonesa na sua casa.', 'Subtítulo do Hero'),
('hero', 'hero_description', 'Peixes selecionados, ingredientes frescos e o verdadeiro sabor da culinária japonesa na sua casa.', 'Descrição do Hero'),
('hero', 'hero_cta_primary', 'Pedir Agora', 'Botão Principal'),
('hero', 'hero_cta_secondary', 'Ver Cardápio', 'Botão Secundário'),
('features', 'feature_1_title', 'Entrega Rápida', 'Feature 1 Título'),
('features', 'feature_1_desc', 'Até 60 minutos', 'Feature 1 Descrição'),
('features', 'feature_2_title', 'Peixes Selecionados', 'Feature 2 Título'),
('features', 'feature_2_desc', 'Qualidade premium todos os dias', 'Feature 2 Descrição'),
('features', 'feature_3_title', 'Embalagem Premium', 'Feature 3 Título'),
('features', 'feature_3_desc', 'Segurança e qualidade', 'Feature 3 Descrição'),
('features', 'feature_4_title', 'Pagamento Seguro', 'Feature 4 Título'),
('features', 'feature_4_desc', 'Seus dados protegidos', 'Feature 4 Descrição'),
('loyalty', 'club_name', 'SushiGo Club', 'Nome do Programa de Fidelidade'),
('loyalty', 'points_per_real', '1', 'Pontos por Real gasto'),
('loyalty', 'reward_500', '10', 'Desconto de R$10 em 500 pontos')
ON CONFLICT (section, key) DO NOTHING;

-- =====================================================
-- 5. BANNERS (Banners promocionais)
-- =====================================================
-- Banners (sem ON CONFLICT pois nao tem UNIQUE constraint especifico)
INSERT INTO banners (title, subtitle, description, button_text, link_url, display_order, is_active, start_date, end_date) VALUES
('PROMOÇÕES EXCLUSIVAS', 'Ofertas especiais toda semana para você aproveitar', 'Veja nossas promoções de combos e produtos selecionados', 'Ver Promoções', '/promocoes', 1, true, NOW(), NOW() + INTERVAL '30 days'),
('NOVIDADE: Hot Rolls', 'Experimente nossos novos hot rolls com sabores exclusivos', 'Crocantes por fora, saborosos por dentro', 'Ver Cardápio', '/cardapio', 2, true, NOW(), NOW() + INTERVAL '30 days');

-- =====================================================
-- 6. HORÁRIO DE FUNCIONAMENTO
-- =====================================================

-- Limpar dados existentes e garantir constraint UNIQUE
DELETE FROM business_hours;

-- Adicionar constraint se não existir (ignora erro se já existe)
ALTER TABLE business_hours DROP CONSTRAINT IF EXISTS business_hours_day_of_week_key;
ALTER TABLE business_hours ADD CONSTRAINT business_hours_day_of_week_key UNIQUE (day_of_week);

INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '11:00:00', '23:30:00', false), -- Domingo
(1, '11:00:00', '23:30:00', false), -- Segunda
(2, '11:00:00', '23:30:00', false), -- Terça
(3, '11:00:00', '23:30:00', false), -- Quarta
(4, '11:00:00', '23:30:00', false), -- Quinta
(5, '11:00:00', '23:30:00', false), -- Sexta
(6, '11:00:00', '23:30:00', false)  -- Sábado
ON CONFLICT (day_of_week) DO NOTHING;

-- =====================================================
-- FIM DO SEED DATA
-- =====================================================
