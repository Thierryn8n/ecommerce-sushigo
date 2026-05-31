-- ============================================
-- SQL para preencher max_weight das tigelas
-- ============================================
-- Rode primeiro o SELECT para ver seus dados,
-- depois adapte os UPDATEs com os IDs corretos.

-- 1) Ver tigelas atuais
SELECT id, name, ml, max_weight, price_addition 
FROM public.bowls 
ORDER BY ml;

-- 2) Atualizar max_weight baseado no nome/tamanho
-- Ajuste os valores conforme suas tigelas.
-- Exemplos comuns (ml ~= max_weight em gramas para açaí):

UPDATE public.bowls 
SET max_weight = 300 
WHERE name ILIKE '%300%' OR name ILIKE '%pequena%' OR name ILIKE '%p%' OR ml = 300;

UPDATE public.bowls 
SET max_weight = 500 
WHERE name ILIKE '%500%' OR name ILIKE '%media%' OR name ILIKE '%m%' OR ml = 500;

UPDATE public.bowls 
SET max_weight = 700 
WHERE name ILIKE '%700%' OR name ILIKE '%grande%' OR name ILIKE '%g%' OR ml = 700;

UPDATE public.bowls 
SET max_weight = 1000 
WHERE name ILIKE '%1l%' OR name ILIKE '%1000%' OR name ILIKE '%gigante%' OR ml = 1000;

-- 3) Fallback: se ainda tiver tigelas sem max_weight, defina baseado no ml
UPDATE public.bowls 
SET max_weight = COALESCE(ml, 500) 
WHERE max_weight IS NULL OR max_weight = 0;

-- 4) Verificar resultado
SELECT id, name, ml, max_weight, price_addition 
FROM public.bowls 
ORDER BY max_weight;
