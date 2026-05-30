-- Adiciona coluna background_color na tabela banners
ALTER TABLE public.banners
ADD COLUMN IF NOT EXISTS background_color character varying(50) NULL DEFAULT '#8B5CF6';
