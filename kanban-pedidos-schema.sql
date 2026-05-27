-- ============================================
-- KANBAN DE PEDIDOS - SCHEMA SUPABASE
-- ============================================

-- Tabela de status do kanban (colunas do kanban)
CREATE TABLE IF NOT EXISTS public.order_status_columns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(50) NOT NULL,           -- Nome exibido: "Pedido Feito", "Em Preparo", etc.
  slug character varying(50) NOT NULL UNIQUE,  -- Identificador: "pedido_feito", "em_preparo"
  color character varying(7) NOT NULL DEFAULT '#6366f1', -- Cor da coluna
  display_order integer NOT NULL DEFAULT 0,    -- Ordem de exibição
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_status_columns_pkey PRIMARY KEY (id)
);

-- Inserir colunas padrão do kanban
INSERT INTO public.order_status_columns (name, slug, color, display_order) VALUES
  ('Pedido Feito', 'pedido_feito', '#f59e0b', 1),      -- Amarelo/Laranja
  ('Em Preparo', 'em_preparo', '#3b82f6', 2),           -- Azul
  ('Pronto', 'pronto', '#10b981', 3),                   -- Verde
  ('Saiu para Entrega', 'saiu_entrega', '#8b5cf6', 4),  -- Roxo
  ('Entregue', 'entregue', '#22c55e', 5),               -- Verde claro
  ('Cancelado', 'cancelado', '#ef4444', 6)              -- Vermelho
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- TABELA DE HISTÓRICO DE MOVIMENTAÇÃO (LOG)
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_column_id uuid REFERENCES public.order_status_columns(id),
  to_column_id uuid NOT NULL REFERENCES public.order_status_columns(id),
  moved_by uuid REFERENCES public.profiles(id), -- Quem moveu (admin/entregador)
  moved_at timestamp with time zone DEFAULT now(),
  notes text, -- Observações opcionais
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_moved_at ON public.order_status_history(moved_at);

-- ============================================
-- TRIGGER PARA ATUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_order_status_columns_updated_at ON public.order_status_columns;
CREATE TRIGGER update_order_status_columns_updated_at
  BEFORE UPDATE ON public.order_status_columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.order_status_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode ver colunas ativas (para o kanban público)
CREATE POLICY "Allow read active columns" ON public.order_status_columns
  FOR SELECT USING (is_active = true);

-- View específica para pedidos cancelados (horizontal)
CREATE OR REPLACE VIEW public.cancelled_orders AS
SELECT 
  o.id,
  o.customer_name,
  o.customer_phone,
  o.total as total_amount,
  o.payment_method,
  o.payment_status,
  o.status as current_status_slug,
  osc.name as current_status_name,
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
LEFT JOIN public.order_status_columns osc ON osc.slug = o.status::character varying
WHERE o.status::character varying = 'cancelado'
ORDER BY o.updated_at DESC;

-- Política: Apenas admins podem gerenciar colunas
CREATE POLICY "Allow admin manage columns" ON public.order_status_columns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Admins e entregadores podem ver histórico
CREATE POLICY "Allow staff read history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'delivery', 'manager')
    )
  );

-- Política: Admins e entregadores podem criar histórico (registrar movimentação)
CREATE POLICY "Allow staff create history" ON public.order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'delivery', 'manager')
    )
  );

-- ============================================
-- VIEW PARA KANBAN (Resumo dos pedidos por status)
-- ============================================
CREATE OR REPLACE VIEW public.kanban_orders AS
SELECT 
  o.id,
  o.customer_name,
  o.customer_phone,
  o.total as total_amount,
  o.payment_method,
  o.payment_status,
  o.status as current_status_slug,
  osc.name as current_status_name,
  osc.color as status_color,
  o.delivery_address,
  o.created_at,
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
LEFT JOIN public.order_status_columns osc ON osc.slug = o.status::character varying
WHERE o.status::character varying NOT IN ('entregue')
  OR (o.status::character varying = 'entregue' AND o.updated_at > now() - interval '24 hours')
  OR o.status::character varying = 'cancelado'
ORDER BY o.created_at DESC;

-- ============================================
-- FUNÇÃO PARA MOVER PEDIDO NO KANBAN
-- ============================================
CREATE OR REPLACE FUNCTION move_order_to_column(
  p_order_id uuid,
  p_new_status_slug character varying,
  p_notes text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_old_status_slug character varying;
  v_old_column_id uuid;
  v_new_column_id uuid;
  v_user_id uuid := auth.uid();
BEGIN
  -- Pegar status atual do pedido (com cast para character varying)
  SELECT status::character varying INTO v_old_status_slug FROM public.orders WHERE id = p_order_id;
  
  -- Pegar IDs das colunas
  SELECT id INTO v_old_column_id FROM public.order_status_columns WHERE slug = v_old_status_slug;
  SELECT id INTO v_new_column_id FROM public.order_status_columns WHERE slug = p_new_status_slug;
  
  -- Atualizar pedido (o cast é automático aqui pois o enum aceita string literal)
  UPDATE public.orders 
  SET status = p_new_status_slug::order_status, updated_at = now()
  WHERE id = p_order_id;
  
  -- Registrar no histórico
  INSERT INTO public.order_status_history (
    order_id, from_column_id, to_column_id, moved_by, notes
  ) VALUES (
    p_order_id, v_old_column_id, v_new_column_id, v_user_id, p_notes
  );
  
  RETURN json_build_object(
    'success', true,
    'order_id', p_order_id,
    'from_status', v_old_status_slug,
    'to_status', p_new_status_slug
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTIFICAÇÕES EM TEMPO REAL (Broadcast)
-- ============================================
-- Habilitar realtime para as tabelas (feito no dashboard do Supabase)
-- ou via SQL:
-- alter publication supabase_realtime add table order_status_history;

COMMENT ON TABLE public.order_status_columns IS 'Colunas do kanban de pedidos';
COMMENT ON TABLE public.order_status_history IS 'Histórico de movimentações no kanban';
