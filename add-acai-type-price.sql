-- Adiciona coluna price_per_kg na tabela acai_types
ALTER TABLE public.acai_types ADD COLUMN IF NOT EXISTS price_per_kg numeric(10, 2) DEFAULT 0;
