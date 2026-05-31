-- =====================================================
-- Corrige triggers da tabela orders que referenciam
-- coluna inexistente 'total_amount' (coluna correta é 'total')
-- =====================================================

-- 1. Dropar todos os triggers existentes na tabela orders
-- (exceto o de updated_at que recriamos abaixo)
DO $$
DECLARE
    trig RECORD;
BEGIN
    FOR trig IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'orders'
        AND trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.orders', trig.trigger_name);
    END LOOP;
END $$;

-- 2. Recriar apenas o trigger de updated_at (inofensivo)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
