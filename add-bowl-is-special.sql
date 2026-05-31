-- Adiciona coluna is_special na tabela bowls
ALTER TABLE public.bowls ADD COLUMN IF NOT EXISTS is_special boolean DEFAULT false;
