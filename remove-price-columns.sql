-- Remove colunas de preço das tabelas
-- ATENÇÃO: Faça backup antes de executar!

-- Tabela products
ALTER TABLE public.products DROP COLUMN IF EXISTS base_price;
ALTER TABLE public.products DROP COLUMN IF EXISTS promotion_price;

-- Tabela bowls
ALTER TABLE public.bowls DROP COLUMN IF EXISTS price_addition;

-- Tabela acai_types
ALTER TABLE public.acai_types DROP COLUMN IF EXISTS price_addition;

-- Tabela toppings
ALTER TABLE public.toppings DROP COLUMN IF EXISTS price;

-- Tabela combos
ALTER TABLE public.combos DROP COLUMN IF EXISTS original_price;
ALTER TABLE public.combos DROP COLUMN IF EXISTS promo_price;

-- Tabela sizes
ALTER TABLE public.sizes DROP COLUMN IF EXISTS price_multiplier;

-- Tabela order_items
ALTER TABLE public.order_items DROP COLUMN IF EXISTS unit_price;
ALTER TABLE public.order_items DROP COLUMN IF EXISTS total_price;

-- Tabela order_item_toppings
ALTER TABLE public.order_item_toppings DROP COLUMN IF EXISTS price;
