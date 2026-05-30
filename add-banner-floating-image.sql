-- Adiciona a coluna floating_image_url na tabela banners
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS floating_image_url text;
