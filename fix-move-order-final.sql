-- ============================================
-- CORREÇÃO FINAL - NOVA FUNÇÃO COM NOME DIFERENTE
-- ============================================

-- 1. Remover TODAS as funções antigas
DROP FUNCTION IF EXISTS public.move_order_to_column(UUID, TEXT);
DROP FUNCTION IF EXISTS public.move_order_to_column(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.move_order_to_column(ORDER_RECORD, TEXT);
DROP FUNCTION IF EXISTS public.move_order_to_column(RECORD, TEXT);

-- 2. Criar NOVA função com nome diferente
CREATE OR REPLACE FUNCTION public.kanban_move_order(
  order_id UUID,
  new_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_status TEXT;
  from_id UUID;
  to_id UUID;
BEGIN
  -- Buscar status atual
  SELECT status INTO old_status
  FROM public.orders
  WHERE id = order_id;

  IF old_status IS NULL THEN
    RAISE EXCEPTION 'Pedido não encontrado';
  END IF;

  IF old_status = new_status THEN
    RETURN;
  END IF;

  -- Buscar IDs das colunas
  SELECT id INTO from_id FROM public.order_status_columns WHERE slug = old_status;
  SELECT id INTO to_id FROM public.order_status_columns WHERE slug = new_status;

  -- Atualizar pedido (cast para order_status)
  UPDATE public.orders
  SET status = new_status::public.order_status,
      updated_at = NOW()
  WHERE id = order_id;

  -- Registrar histórico
  INSERT INTO public.order_status_history (order_id, from_column_id, to_column_id, moved_at, moved_by)
  VALUES (order_id, from_id, to_id, NOW(), auth.uid());

  RETURN;
END;
$$;

-- 3. Verificar
SELECT 'Função kanban_move_order criada' as status;
