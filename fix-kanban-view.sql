-- ============================================
-- CORREÇÃO DA VIEW KANBAN_ORDERS
-- ============================================

-- Remover view existente primeiro
DROP VIEW IF EXISTS public.kanban_orders;

-- Recriar a view kanban_orders com correção de tipos
CREATE VIEW public.kanban_orders AS
SELECT 
  o.id,
  o.customer_name,
  o.customer_phone,
  o.total as total_amount,
  o.status::text as current_status_slug,
  o.payment_method::text as payment_method,
  o.payment_status::text as payment_status,
  osc.name as status_display,
  osc.color as status_color,
  o.delivery_address,
  o.created_at,
  o.updated_at as cancelled_at,
  o.estimated_delivery as estimated_delivery_time,
  (
    SELECT json_agg(
      json_build_object(
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price
      )
    )
    FROM public.order_items oi 
    WHERE oi.order_id = o.id
  ) as items,
  (
    SELECT json_agg(
      json_build_object(
        'from_status', osc_from.name,
        'to_status', osc_to.name,
        'moved_at', osh.moved_at,
        'moved_by_name', COALESCE(p.full_name, 'Sistema')
      ) ORDER BY osh.moved_at DESC
    )
    FROM public.order_status_history osh
    LEFT JOIN public.order_status_columns osc_from ON osc_from.id = osh.from_column_id
    LEFT JOIN public.order_status_columns osc_to ON osc_to.id = osh.to_column_id
    LEFT JOIN public.profiles p ON p.id = osh.moved_by
    WHERE osh.order_id = o.id
  ) as status_history
FROM public.orders o
LEFT JOIN public.order_status_columns osc ON osc.slug = o.status::text
WHERE o.status::text <> 'entregue' 
   OR (
     o.status::text = 'entregue' 
     AND o.updated_at > NOW() - INTERVAL '24 hours'
   )
ORDER BY o.created_at DESC;

-- ============================================
-- VERIFICAR SE AS COLUNAS DO KANBAN EXISTEM
-- ============================================

-- Inserir colunas padrão se não existirem
INSERT INTO public.order_status_columns (slug, name, color, display_order)
VALUES 
  ('pendente', 'Pendente', '#F59E0B', 1),
  ('confirmado', 'Confirmado', '#3B82F6', 2),
  ('preparando', 'Preparando', '#8B5CF6', 3),
  ('saiu_entrega', 'Saiu p/ Entrega', '#F97316', 4),
  ('entregue', 'Entregue', '#22C55E', 5),
  ('cancelado', 'Cancelado', '#EF4444', 6)
ON CONFLICT (slug) DO NOTHING;

-- Verificar colunas criadas
SELECT * FROM public.order_status_columns ORDER BY display_order;

-- ============================================
-- PERMISSÕES
-- ============================================

-- Remover política existente se houver
DROP POLICY IF EXISTS "Allow staff read kanban_orders" ON public.orders;

-- Política para permitir leitura da view kanban_orders
CREATE POLICY "Allow staff read kanban_orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'delivery', 'manager', 'staff')
    )
  );
