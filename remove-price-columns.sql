-- =====================================================
-- Remove colunas de preço fixo do banco de dados
-- O preço passa a ser calculado apenas por peso (kg)
-- =====================================================

-- 1. Produtos: remove preços fixos (preço vem do tipo de açaí por kg)
ALTER TABLE public.products DROP COLUMN IF EXISTS base_price;
ALTER TABLE public.products DROP COLUMN IF EXISTS promotion_price;

-- 2. Vasilias: remove adicional de preço
ALTER TABLE public.bowls DROP COLUMN IF EXISTS price_addition;

-- 3. Adicionais (toppings): remove preço fixo
ALTER TABLE public.toppings DROP COLUMN IF EXISTS price;

-- 4. Tipos de açaí: remove adicional de preço (mantém price_per_kg)
ALTER TABLE public.acai_types DROP COLUMN IF EXISTS price_addition;

-- 5. Tamanhos: remove multiplicador de preço
ALTER TABLE public.sizes DROP COLUMN IF EXISTS price_multiplier;

-- 6. Combos: remove preços (se ainda forem usados no futuro, recriar)
-- ALTER TABLE public.combos DROP COLUMN IF EXISTS original_price;
-- ALTER TABLE public.combos DROP COLUMN IF EXISTS promo_price;

-- =====================================================
-- NOTA: As tabelas de pedidos (order_items, order_item_toppings)
-- mantêm suas colunas de preço para preservar o histórico
-- de quanto o cliente pagou em cada pedido.
-- =====================================================
