-- ============================================
-- CORREÇÃO COMPLETA DO KANBAN
-- ============================================

-- 1. Remover TODAS as funções move_order_to_column existentes
DROP FUNCTION IF EXISTS public.move_order_to_column(UUID, TEXT);
DROP FUNCTION IF EXISTS public.move_order_to_column(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.move_order_to_column(ORDER_RECORD, TEXT);

-- 2. Criar função RPC com nome único (usando parâmetros nomeados)
CREATE OR REPLACE FUNCTION public.move_order_to_column(
  p_order_id UUID,
  p_new_status_slug TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status TEXT;
  v_from_column_id UUID;
  v_to_column_id UUID;
BEGIN
  -- Buscar status atual do pedido
  SELECT status INTO v_old_status
  FROM public.orders
  WHERE id = p_order_id;

  -- Se não encontrou o pedido, retornar
  IF v_old_status IS NULL THEN
    RAISE EXCEPTION 'Pedido não encontrado: %', p_order_id;
  END IF;

  -- Se o status não mudou, não fazer nada
  IF v_old_status = p_new_status_slug THEN
    RETURN;
  END IF;

  -- Buscar ID das colunas
  SELECT id INTO v_from_column_id
  FROM public.order_status_columns
  WHERE slug = v_old_status;

  SELECT id INTO v_to_column_id
  FROM public.order_status_columns
  WHERE slug = p_new_status_slug;

  -- Atualizar o status do pedido
  UPDATE public.orders
  SET status = p_new_status_slug,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- Registrar no histórico
  IF v_to_column_id IS NOT NULL THEN
    INSERT INTO public.order_status_history (order_id, from_column_id, to_column_id, moved_at, moved_by)
    VALUES (p_order_id, v_from_column_id, v_to_column_id, NOW(), auth.uid());
  END IF;

  RETURN;
END;
$$;

-- 3. Criar view cancelled_orders (se kanban_orders existir)
DO $$
BEGIN
  -- Verificar se kanban_orders existe
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'kanban_orders' AND schemaname = 'public') THEN
    -- Criar view cancelled_orders
    CREATE OR REPLACE VIEW public.cancelled_orders AS
    SELECT * FROM public.kanban_orders
    WHERE current_status_slug = 'cancelado'
    ORDER BY cancelled_at DESC
    LIMIT 50;
  END IF;
END $$;

-- 4. Garantir permissões nas views
GRANT SELECT ON public.kanban_orders TO authenticated;
GRANT SELECT ON public.cancelled_orders TO authenticated;

-- Verificar
SELECT 'Função criada:' as check, p.proname 
FROM pg_proc p 
JOIN pg_namespace n ON n.oid = p.pronamespace 
WHERE n.nspname = 'public' AND p.proname = 'move_order_to_column';
