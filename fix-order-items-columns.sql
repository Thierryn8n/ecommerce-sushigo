-- Adicionar colunas toppings e sauces na tabela order_items
-- Execute este SQL no Supabase para corrigir o erro 400

-- Adicionar coluna toppings como JSONB
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS toppings jsonb DEFAULT '[]'::jsonb;

-- Adicionar coluna sauces como JSONB  
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS sauces jsonb DEFAULT '[]'::jsonb;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items';
