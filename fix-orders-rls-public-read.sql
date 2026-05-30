-- ============================================
-- PERMITIR LEITURA PUBLICA NA TABELA ORDERS
-- (Necessario para o app desktop de impressao)
-- ============================================

-- 1. Verificar se RLS esta habilitado
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Criar policy para leitura publica (anon) de todos os pedidos
DROP POLICY IF EXISTS "Public read access orders" ON public.orders;
CREATE POLICY "Public read access orders"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Tambem permitir update no campo printed para anon (app desktop)
DROP POLICY IF EXISTS "Allow anon update printed" ON public.orders;
CREATE POLICY "Allow anon update printed"
ON public.orders
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
