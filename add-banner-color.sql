-- Adiciona coluna color na tabela banners
ALTER TABLE public.banners ADD COLUMN color character varying(7) DEFAULT '#8B5CF6';

-- Atualiza banners existentes com cor padrao
UPDATE public.banners SET color = '#8B5CF6' WHERE color IS NULL;
