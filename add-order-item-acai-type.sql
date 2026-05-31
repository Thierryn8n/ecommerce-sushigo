-- Adiciona coluna acai_type na tabela order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS acai_type character varying(100);
