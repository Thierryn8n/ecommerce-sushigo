-- ============================================
-- MULTI-TENANCY: SUPORTE A MÚLTIPLAS LOJAS
-- ============================================
-- Execute este SQL para transformar o sistema em multi-tenant

-- ============================================
-- 1. CRIAR TABELA stores (lojas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  slug character varying(100) NOT NULL UNIQUE,
  description text,
  logo_url text,
  banner_url text,
  primary_color character varying(7) DEFAULT '#5B1E87',
  secondary_color character varying(7) DEFAULT '#FF8C00',
  accent_color character varying(7) DEFAULT '#8A2BE2',
  background_color character varying(7) DEFAULT '#120018',
  whatsapp_number character varying(20),
  email character varying(255),
  phone character varying(20),
  address text,
  city character varying(100),
  state character varying(2),
  zip_code character varying(10),
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stores_pkey PRIMARY KEY (id),
  CONSTRAINT stores_slug_key UNIQUE (slug)
);

-- Criar índice para busca por slug
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_active ON public.stores(is_active);

-- ============================================
-- 2. ADICIONAR store_id ÀS TABELAS EXISTENTES
-- ============================================

-- Products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);

-- Categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON public.categories(store_id);

-- Bowls
ALTER TABLE public.bowls ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_bowls_store_id ON public.bowls(store_id);

-- Acai Types
ALTER TABLE public.acai_types ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_acai_types_store_id ON public.acai_types(store_id);

-- Toppings
ALTER TABLE public.toppings ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_toppings_store_id ON public.toppings(store_id);

-- Sizes
ALTER TABLE public.sizes ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_sizes_store_id ON public.sizes(store_id);

-- Combos
ALTER TABLE public.combos ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_combos_store_id ON public.combos(store_id);

-- Combo Items
ALTER TABLE public.combo_items ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_combo_items_store_id ON public.combo_items(store_id);

-- Coupons
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_coupons_store_id ON public.coupons(store_id);

-- Banners
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_banners_store_id ON public.banners(store_id);

-- Delivery Areas
ALTER TABLE public.delivery_areas ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_delivery_areas_store_id ON public.delivery_areas(store_id);

-- Business Hours
ALTER TABLE public.business_hours ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_business_hours_store_id ON public.business_hours(store_id);

-- Store Settings
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_store_settings_store_id ON public.store_settings(store_id);

-- App Settings
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_app_settings_store_id ON public.app_settings(store_id);

-- Orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);

-- Order Items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_order_items_store_id ON public.order_items(store_id);

-- Order Item Toppings
ALTER TABLE public.order_item_toppings ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_order_item_toppings_store_id ON public.order_item_toppings(store_id);

-- Reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_reviews_store_id ON public.reviews(store_id);

-- Wishlist
ALTER TABLE public.wishlist ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_wishlist_store_id ON public.wishlist(store_id);

-- Notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_notifications_store_id ON public.notifications(store_id);

-- ============================================
-- 3. CRIAR LOJA PADRÃO (AÇAÍ DA PRAIA)
-- ============================================
INSERT INTO public.stores (
  id,
  name,
  slug,
  description,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  whatsapp_number,
  instagram_url,
  is_active
) VALUES (
  gen_random_uuid(),
  'Açaí da Praia',
  'acai-da-pria',
  'O melhor açaí de Canoa Quebrada. Açaí cremoso, ingredientes selecionados e aquele toque especial que só a gente tem!',
  '#5B1E87',
  '#FF8C00',
  '#8A2BE2',
  '#120018',
  '5588999999999',
  'https://instagram.com/acaidapraia',
  true
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 4. ATUALIZAR DADOS EXISTENTES COM store_id
-- ============================================
-- Isso precisa ser feito após criar a loja padrão
-- Você precisará pegar o ID da loja criada acima

-- Exemplo (substitua UUID pelo ID da loja criada):
-- UPDATE public.products SET store_id = 'UUID_DA_LOJA' WHERE store_id IS NULL;
-- UPDATE public.categories SET store_id = 'UUID_DA_LOJA' WHERE store_id IS NULL;
-- ... fazer o mesmo para todas as tabelas

-- ============================================
-- 5. POLÍTICAS RLS PARA MULTI-TENANCY
-- ============================================

-- Habilitar RLS na tabela stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode ler lojas ativas
CREATE POLICY "Public read active stores" ON public.stores
  FOR SELECT
  USING (is_active = true);

-- Política: Apenas admins podem gerenciar lojas
CREATE POLICY "Admin manage stores" ON public.stores
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- 6. FUNÇÃO PARA OBTER LOJA ATUAL
-- ============================================
CREATE OR REPLACE FUNCTION public.get_current_store(store_slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT id FROM public.stores
    WHERE slug = store_slug AND is_active = true
    LIMIT 1
  );
END;
$$;

-- ============================================
-- 7. TRIGGER PARA ATUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute para verificar se tudo foi criado corretamente
-- SELECT * FROM public.stores;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'stores';
