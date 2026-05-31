-- ============================================
-- CORREÇÃO DA FUNÇÃO RPC move_order_to_column
-- ============================================

-- Remover função existente se houver
DROP FUNCTION IF EXISTS public.move_order_to_column(UUID, TEXT);

-- Criar função RPC para mover pedido entre colunas
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

  -- Registrar no histórico (tabela opcional)
  BEGIN
    INSERT INTO public.order_status_history (order_id, from_column_id, to_column_id, moved_at, moved_by)
    VALUES (p_order_id, v_from_column_id, v_to_column_id, NOW(), auth.uid());
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignora erro se a tabela não existir
      NULL;
  END;

  RETURN;
END;
$$;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se a função foi criada
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname = 'move_order_to_column';
