-- Adiciona coluna de peso na tabela order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS weight_grams integer DEFAULT 0;
