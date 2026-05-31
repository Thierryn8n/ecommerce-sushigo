-- ============================================
-- MIGRAÇÃO: Adicionar campo max_quantity à tabela toppings
-- ============================================
-- Execute este SQL no Supabase SQL Editor para adicionar o campo max_quantity

-- Adicionar campo max_quantity à tabela toppings
ALTER TABLE public.toppings 
ADD COLUMN IF NOT EXISTS max_quantity integer DEFAULT 5;

-- Atualizar valores existentes com quantidade máxima padrão
UPDATE public.toppings 
SET max_quantity = 5 
WHERE max_quantity IS NULL;

-- Atualizar valores específicos para diferentes categorias
UPDATE public.toppings 
SET max_quantity = 3 
WHERE category IN ('fruta', 'granola', 'extra', 'doce');

UPDATE public.toppings 
SET max_quantity = 2 
WHERE category IN ('calda', 'creme', 'chocolate');

UPDATE public.toppings 
SET max_quantity = 2 
WHERE name IN ('Whey Protein', 'Pasta de Amendoim');

-- ============================================
-- Verificação
-- ============================================
-- Execute para verificar se o campo foi adicionado corretamente
-- SELECT * FROM public.toppings LIMIT 5;
