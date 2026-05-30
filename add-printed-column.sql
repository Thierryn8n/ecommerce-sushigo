-- ============================================
-- ADICIONAR COLUNA PRINTED A TABELA ORDERS
-- (Necessaria para o app desktop de impressao)
-- ============================================

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS printed boolean DEFAULT false;

-- Criar indice para performance
CREATE INDEX IF NOT EXISTS idx_orders_printed ON public.orders(printed);

-- ============================================
-- POLITICA RLS PARA ATUALIZAR PRINTED
-- ============================================

-- Politica para usuarios autenticados atualizarem o campo printed
DROP POLICY IF EXISTS "Allow authenticated update printed" ON public.orders;
CREATE POLICY "Allow authenticated update printed"
ON public.orders
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
