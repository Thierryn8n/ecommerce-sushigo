-- =====================================================
-- MIGRATION: Renomear categorias de AÇAÍ para SUSHI
-- =====================================================
-- Execute no Supabase para atualizar referências acai

UPDATE public.categories 
SET name = 'Sashimis' WHERE slug = 'acai_tipo_a' OR name ILIKE '%acai%';

UPDATE public.app_settings 
SET value = 'O melhor sushi, onde você estiver.' 
WHERE section = 'hero' AND key = 'hero_title';

UPDATE public.app_settings 
SET value = 'Peixes selecionados, ingredientes frescos e o verdadeiro sabor da culinária japonesa na sua casa.' 
WHERE section = 'hero' AND key = 'hero_description';

UPDATE public.banners 
SET title = 'O melhor sushi, onde você estiver.', 
    subtitle = 'Peixes frescos direto para sua casa',
    description = 'Ingredientes selecionados e o verdadeiro sabor da culinária japonesa'
WHERE title ILIKE '%acai%' OR title IS NULL;

-- Atualizar horarios conforme a imagem (11:00 - 23:30)
DELETE FROM public.business_hours;

INSERT INTO public.business_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '11:00'::time, '23:30'::time, false),  -- Domingo
(1, '11:00'::time, '23:30'::time, false),  -- Segunda
(2, '11:00'::time, '23:30'::time, false),  -- Terça
(3, '11:00'::time, '23:30'::time, false),  -- Quarta
(4, '11:00'::time, '23:30'::time, false),  -- Quinta
(5, '11:00'::time, '23:30'::time, false),  -- Sexta
(6, '11:00'::time, '23:30'::time, false);  -- Sábado
