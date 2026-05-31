-- ============================================
-- MIGRAÇÃO COMPLETA PARA ESTRUTURA SUSHI
-- Sistema de Combos, Variações e Peças
-- ============================================

-- ============================================
-- 1. LIMPAR ESTRUTURA ANTIGA
-- ============================================

-- Remover tabelas antigas de açaí
DROP TABLE IF EXISTS public.acai_types CASCADE;
DROP TABLE IF EXISTS public.bowls CASCADE;
DROP TABLE IF EXISTS public.acai_order_items CASCADE;

-- ============================================
-- 2. CRIAR TABELA DE TIPOS DE SUSHI
-- ============================================

CREATE TABLE IF NOT EXISTS public.sushi_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- Ex: "Hot Roll", "Uramaki", "Sashimi"
  description TEXT,
  category VARCHAR(50) NOT NULL, -- "maki", "nigiri", "sashimi", "hot", "especial"
  pieces_per_serving INTEGER DEFAULT 8, -- Peças por porção padrão
  is_raw BOOLEAN DEFAULT false, -- É cru (sashimi)?
  is_fried BOOLEAN DEFAULT false, -- É frito (hot roll)?
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir tipos de sushi do cardápio
INSERT INTO public.sushi_types (name, description, category, pieces_per_serving, is_raw, is_fried, display_order) VALUES
-- Sashimis (cru)
('Sashimi Salmão', 'Fatias finas de salmão fresco', 'sashimi', 5, true, false, 1),
('Sashimi Atum', 'Fatias finas de atum fresco', 'sashimi', 5, true, false, 2),
('Sashimi Peixe Branco', 'Fatias finas de peixe branco', 'sashimi', 5, true, false, 3),
('Sashimi Mix Premium', 'Mix de sashimis nobres', 'sashimi', 15, true, false, 4),

-- Niguiris (2 unidades)
('Niguiri Salmão', 'Salmão fresco sobre arroz', 'nigiri', 2, true, false, 10),
('Niguiri Atum', 'Atum fresco sobre arroz', 'nigiri', 2, true, false, 11),
('Niguiri Peixe Branco', 'Peixe branco sobre arroz', 'nigiri', 2, true, false, 12),
('Niguiri Camarão', 'Camarão sobre arroz', 'nigiri', 2, false, false, 13),
('Niguiri Polvo', 'Polvo sobre arroz', 'nigiri', 2, true, false, 14),

-- Hot Rolls e Empanados (fritos, 10 peças)
('Hot Roll Salmão', 'Rolinho de salmão empanado e frito', 'hot', 10, false, true, 20),
('Hot Roll Filadélfia', 'Rolinho de cream cheese e salmão empanado', 'hot', 10, false, true, 21),
('Hot Especial', 'Rolinho especial da casa empanado', 'hot', 10, false, true, 22),
('Kani Empanado', 'Rolinho de kani empanado', 'hot', 10, false, true, 23),
('Camarão Empanado', 'Rolinho de camarão empanado', 'hot', 10, false, true, 24),
('Harumaki', 'Rolinho primavera tradicional', 'hot', 4, false, true, 25),

-- Uramakis (8 peças, arroz por fora)
('Uramaki Filadélfia', 'Cream cheese e salmão', 'uramaki', 8, false, false, 30),
('Uramaki Salmão Grelhado', 'Salmão grelhado com arroz', 'uramaki', 8, false, false, 31),
('Uramaki Camarão Cream Cheese', 'Camarão com cream cheese', 'uramaki', 8, false, false, 32),
('Uramaki Skin Especial', 'Pele de salmão especial', 'uramaki', 8, false, false, 33),
('Uramaki Atum', 'Atum fresco com arroz', 'uramaki', 8, false, false, 34),

-- Hossomakis (8 peças, arroz por dentro, nori por fora)
('Hossomaki Salmão', 'Salmão tradicional enrolado', 'hossomaki', 8, true, false, 40),
('Hossomaki Atum', 'Atum tradicional enrolado', 'hossomaki', 8, true, false, 41),
('Hossomaki Pepino', 'Pepino fresco enrolado', 'hossomaki', 8, false, false, 42),
('Hossomaki Kani', 'Kani tradicional enrolado', 'hossomaki', 8, false, false, 43),

-- Joes (2 unidades, especiais)
('Joe Salmão', 'Joe especial de salmão', 'joe', 2, true, false, 50),
('Joe Filadélfia', 'Joe com cream cheese', 'joe', 2, true, false, 51),
('Joe Trufado', 'Joe com azeite trufado', 'joe', 2, true, false, 52),
('Joe Camarão', 'Joe de camarão', 'joe', 2, false, false, 53),

-- Porções
('Camarão Empanado Porção', 'Porção de camarão empanado', 'porcao', 12, false, true, 60),
('Shimeji na Manteiga', 'Shimeji salteado na manteiga', 'porcao', 1, false, false, 61),
('Guioza', 'Dumplings japoneses', 'porcao', 6, false, false, 62),
('Sunomono', 'Salada de pepino agridoce', 'porcao', 1, false, false, 63),

-- Sobremesas
('Harumaki de Chocolate', 'Rolinho doce de chocolate', 'sobremesa', 1, false, true, 70),
('Temaki de Nutella', 'Cone doce de Nutella', 'sobremesa', 1, false, false, 71),
('Petit Gateau', 'Bolo quente com sorvete', 'sobremesa', 1, false, false, 72),
('Cheesecake Frutas Vermelhas', 'Cheesecake com calda', 'sobremesa', 1, false, false, 73);

-- ============================================
-- 3. ATUALIZAR TABELA PRODUCTS
-- ============================================

-- Adicionar colunas novas para sushi
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_variable_quantity BOOLEAN DEFAULT false, -- Tem variações de quantidade?
  ADD COLUMN IF NOT EXISTS base_pieces INTEGER DEFAULT 1, -- Peças na quantidade base
  ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 1, -- Mínimo para variações
  ADD COLUMN IF NOT EXISTS max_quantity INTEGER DEFAULT 1, -- Máximo para variações
  ADD COLUMN IF NOT EXISTS sushi_type_id UUID REFERENCES public.sushi_types(id),
  ADD COLUMN IF NOT EXISTS molhos_included BOOLEAN DEFAULT false; -- Inclui molhos?

-- Remover colunas antigas de açaí
ALTER TABLE public.products 
  DROP COLUMN IF EXISTS base_weight_grams,
  DROP COLUMN IF EXISTS bowl_id;

-- ============================================
-- 4. CRIAR TABELA DE VARIAÇÕES DE PRODUTO
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name VARCHAR(100) NOT NULL, -- Ex: "5 peças", "10 peças", "20 peças"
  quantity_value INTEGER NOT NULL, -- 5, 10, 20
  price DECIMAL(10,2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- ============================================
-- 5. CRIAR TABELA DE ITENS DE COMBO
-- ============================================

CREATE TABLE IF NOT EXISTS public.combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sushi_type_id UUID NOT NULL REFERENCES public.sushi_types(id),
  quantity INTEGER NOT NULL DEFAULT 1, -- Quantidade deste item no combo
  is_substitutable BOOLEAN DEFAULT false, -- Pode trocar por outro do mesmo valor?
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_combo_items_combo_id ON public.combo_items(combo_product_id);

-- ============================================
-- 6. ATUALIZAR TABELA ORDER_ITEMS
-- ============================================

ALTER TABLE public.order_items
  DROP COLUMN IF EXISTS bowl_id,
  DROP COLUMN IF EXISTS acai_type_id,
  DROP COLUMN IF EXISTS weight_grams,
  DROP COLUMN IF EXISTS toppings,
  DROP COLUMN IF EXISTS sauces;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id),
  ADD COLUMN IF NOT EXISTS quantity_pieces INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS selected_molhos TEXT[], -- Molhos escolhidos
  ADD COLUMN IF NOT EXISTS combo_details JSONB; -- Detalhes dos itens do combo (se for combo)

-- ============================================
-- 7. ATUALIZAR TABELA SAUCES (MOLHOS)
-- ============================================

-- Limpar molhos antigos de açaí
DELETE FROM public.sauces;

-- Inserir molhos japoneses
INSERT INTO public.sauces (name, description, is_free, max_quantity, is_active, display_order) VALUES
('Shoyu Tradicional', 'Molho de soja tradicional japonês', true, 3, true, 1),
('Shoyu Premium', 'Molho de soja envelhecido', true, 2, true, 2),
('Wasabi', 'Raiz forte japonesa', true, 2, true, 3),
('Gengibre em Conserva', 'Gengibre rosa tradicional', true, 3, true, 4),
('Tarê', 'Molho agridoce para hot rolls', true, 2, true, 5),
('Molho Agridoce', 'Molho oriental agridoce', true, 2, true, 6),
('Hashis Descartáveis', 'Par de hashis descartáveis', true, 10, true, 7);

-- Remover coluna de peso
ALTER TABLE public.sauces DROP COLUMN IF EXISTS weight_grams;

-- ============================================
-- 8. CRIAR VIEW DE COMBOS COMPLETOS
-- ============================================

CREATE OR REPLACE VIEW public.combo_details_view AS
SELECT 
  p.id as combo_id,
  p.name as combo_name,
  p.price as combo_price,
  p.base_pieces as total_pieces,
  jsonb_agg(
    jsonb_build_object(
      'sushi_type_id', st.id,
      'sushi_name', st.name,
      'category', st.category,
      'quantity', ci.quantity,
      'pieces_per_serving', st.pieces_per_serving,
      'total_pieces', ci.quantity * st.pieces_per_serving
    ) ORDER BY ci.display_order
  ) as items
FROM public.products p
JOIN public.combo_items ci ON ci.combo_product_id = p.id
JOIN public.sushi_types st ON st.id = ci.sushi_type_id
WHERE p.is_combo = true
GROUP BY p.id, p.name, p.price, p.base_pieces;

-- ============================================
-- 9. FUNÇÃO PARA CRIAR COMBO EXECUTIVO
-- ============================================

CREATE OR REPLACE FUNCTION public.create_executive_combo(
  p_name TEXT,
  p_description TEXT,
  p_price DECIMAL,
  p_total_pieces INTEGER,
  p_items JSONB -- [{"sushi_type_name": "Hot Roll", "quantity": 4}, ...]
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_id UUID;
  v_item RECORD;
  v_sushi_type_id UUID;
BEGIN
  -- Criar produto combo
  INSERT INTO public.products (
    name, description, slug, is_combo, base_pieces, 
    is_active, category_id, molhos_included
  )
  VALUES (
    p_name, p_description, lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g')), 
    true, p_total_pieces, true, 
    (SELECT id FROM public.categories WHERE slug = 'combos' LIMIT 1),
    true
  )
  RETURNING id INTO v_product_id;
  
  -- Adicionar itens do combo
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(sushi_type_name TEXT, quantity INTEGER)
  LOOP
    SELECT id INTO v_sushi_type_id 
    FROM public.sushi_types 
    WHERE name ILIKE '%' || v_item.sushi_type_name || '%' 
    LIMIT 1;
    
    IF v_sushi_type_id IS NOT NULL THEN
      INSERT INTO public.combo_items (combo_product_id, sushi_type_id, quantity)
      VALUES (v_product_id, v_sushi_type_id, v_item.quantity);
    END IF;
  END LOOP;
  
  RETURN v_product_id;
END;
$$;

-- ============================================
-- 10. INSERIR PRODUTOS DO CARDÁPIO
-- ============================================

-- Categorias base
INSERT INTO public.categories (name, slug, color, is_active, display_order) VALUES
('Combos Executivos', 'combos-executivos', '#D62828', true, 1),
('Combos para Grupos', 'combos-grupos', '#D62828', true, 2),
('Sashimis', 'sashimis', '#D4A017', true, 3),
('Niguiris', 'niguiris', '#D4A017', true, 4),
('Hot Rolls e Empanados', 'hot-rolls', '#D62828', true, 5),
('Uramakis', 'uramakis', '#D4A017', true, 6),
('Hossomakis', 'hossomakis', '#D4A017', true, 7),
('Joes Especiais', 'joes', '#D4A017', true, 8),
('Especiais da Casa', 'especiais-casa', '#D62828', true, 9),
('Porções', 'porcoes', '#1E1E1E', true, 10),
('Bebidas', 'bebidas', '#1E1E1E', true, 11),
('Sobremesas', 'sobremesas', '#D62828', true, 12),
('Rodízio em Casa', 'rodizio', '#D62828', true, 13)
ON CONFLICT (slug) DO NOTHING;

-- Limpar produtos antigos
DELETE FROM public.products WHERE is_combo = false OR is_combo IS NULL;

-- Combo Individual - 20 Peças
INSERT INTO public.products (name, slug, description, price, is_combo, base_pieces, is_active, category_id, molhos_included)
SELECT 
  'Combo Individual – 20 Peças',
  'combo-individual-20-pecas',
  '4 Hot Roll, 4 Kani Empanado, 4 Uramaki Salmão, 4 Hossomaki Pepino, 4 Niguiri Salmão',
  39.90,
  true,
  20,
  true,
  id,
  true
FROM public.categories WHERE slug = 'combos-executivos';

-- Combo Casal - 40 Peças
INSERT INTO public.products (name, slug, description, price, is_combo, base_pieces, is_active, category_id, molhos_included)
SELECT 
  'Combo Casal – 40 Peças',
  'combo-casal-40-pecas',
  '8 Hot Roll, 8 Uramaki Filadélfia, 8 Hossomaki Salmão, 8 Niguiri Salmão, 8 Joe Salmão',
  79.90,
  true,
  40,
  true,
  id,
  true
FROM public.categories WHERE slug = 'combos-executivos';

-- Combo Família - 80 Peças
INSERT INTO public.products (name, slug, description, price, is_combo, base_pieces, is_active, category_id, molhos_included)
SELECT 
  'Combo Família – 80 Peças',
  'combo-familia-80-pecas',
  '20 Hot Roll, 20 Uramaki Filadélfia, 10 Hossomaki Salmão, 10 Hossomaki Kani, 10 Joe Salmão, 10 Niguiri Salmão',
  149.90,
  true,
  80,
  true,
  id,
  true
FROM public.categories WHERE slug = 'combos-executivos';

-- Sashimi Salmão com variações
INSERT INTO public.products (name, slug, description, is_variable_quantity, base_pieces, is_active, category_id)
SELECT 
  'Sashimi Salmão Premium',
  'sashimi-salmao',
  'Fatias finas de salmão fresco de alta qualidade',
  true,
  5,
  true,
  id
FROM public.categories WHERE slug = 'sashimis';

-- Adicionar variações ao Sashimi Salmão
INSERT INTO public.product_variants (product_id, variant_name, quantity_value, price, is_default, display_order)
SELECT id, '5 peças', 5, 16.90, true, 1 FROM public.products WHERE slug = 'sashimi-salmao'
UNION ALL
SELECT id, '10 peças', 10, 29.90, false, 2 FROM public.products WHERE slug = 'sashimi-salmao'
UNION ALL
SELECT id, '20 peças', 20, 54.90, false, 3 FROM public.products WHERE slug = 'sashimi-salmao';

-- Niguiri Salmão (2 unidades)
INSERT INTO public.products (name, slug, description, price, base_pieces, is_active, category_id)
SELECT 
  'Niguiri Salmão',
  'niguiri-salmao',
  '2 unidades de salmão fresco sobre arroz',
  10.90,
  2,
  true,
  id
FROM public.categories WHERE slug = 'niguiris';

-- Hot Roll Salmão (10 peças)
INSERT INTO public.products (name, slug, description, price, base_pieces, is_active, category_id, molhos_included)
SELECT 
  'Hot Roll Salmão',
  'hot-roll-salmao',
  '10 peças de rolinho de salmão empanado e frito',
  24.90,
  10,
  true,
  id,
  true
FROM public.categories WHERE slug = 'hot-rolls';

-- Uramaki Filadélfia (8 peças)
INSERT INTO public.products (name, slug, description, price, base_pieces, is_active, category_id)
SELECT 
  'Uramaki Filadélfia',
  'uramaki-filadelfia',
  '8 peças de cream cheese e salmão com arroz por fora',
  22.90,
  8,
  true,
  id
FROM public.categories WHERE slug = 'uramakis';

-- Hossomaki Salmão (8 peças)
INSERT INTO public.products (name, slug, description, price, base_pieces, is_active, category_id)
SELECT 
  'Hossomaki Salmão',
  'hossomaki-salmao',
  '8 peças tradicionais de salmão enrolado',
  18.90,
  8,
  true,
  id
FROM public.categories WHERE slug = 'hossomakis';

-- Joe Salmão (2 unidades)
INSERT INTO public.products (name, slug, description, price, base_pieces, is_active, category_id)
SELECT 
  'Joe Salmão',
  'joe-salmao',
  '2 unidades do especial Joe de salmão',
  12.90,
  2,
  true,
  id
FROM public.categories WHERE slug = 'joes';

-- Bebidas
INSERT INTO public.products (name, slug, description, price, base_pieces, is_active, category_id)
SELECT 
  'Água', 'agua', 'Água mineral 500ml', 4.90, 1, true, id
FROM public.categories WHERE slug = 'bebidas'
UNION ALL
SELECT 
  'Refrigerante Lata', 'refrigerante-lata', 'Lata 350ml', 6.90, 1, true, id
FROM public.categories WHERE slug = 'bebidas'
UNION ALL
SELECT 
  'Suco Natural', 'suco-natural', 'Suco natural da fruta 300ml', 9.90, 1, true, id
FROM public.categories WHERE slug = 'bebidas';

-- ============================================
-- 11. ADICIONAR ITENS AOS COMBOS
-- ============================================

-- Adicionar itens ao Combo Individual
INSERT INTO public.combo_items (combo_product_id, sushi_type_id, quantity)
SELECT 
  p.id as combo_id,
  st.id as sushi_type_id,
  CASE 
    WHEN st.name = 'Hot Roll Salmão' THEN 4
    WHEN st.name = 'Kani Empanado' THEN 4
    WHEN st.name = 'Uramaki Salmão Grelhado' THEN 4
    WHEN st.name = 'Hossomaki Pepino' THEN 4
    WHEN st.name = 'Niguiri Salmão' THEN 4
  END as quantity
FROM public.products p
CROSS JOIN public.sushi_types st
WHERE p.slug = 'combo-individual-20-pecas'
AND st.name IN ('Hot Roll Salmão', 'Kani Empanado', 'Uramaki Salmão Grelhado', 'Hossomaki Pepino', 'Niguiri Salmão');

-- ============================================
-- 12. PERMISSÕES
-- ============================================

GRANT SELECT ON public.sushi_types TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.combo_items TO anon, authenticated;
GRANT SELECT ON public.combo_details_view TO anon, authenticated;

-- ============================================
-- 13. TRIGGER PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sushi_types_updated_at
  BEFORE UPDATE ON public.sushi_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
