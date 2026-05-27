-- ============================================
-- CRIAR TABELA stores (lojas)
-- ============================================
-- Execute este SQL para criar a tabela de lojas
-- Necessário para o setup inicial do sistema

CREATE TABLE IF NOT EXISTS public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
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
  CONSTRAINT stores_pkey PRIMARY KEY (id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_stores_active ON public.stores(is_active);

-- Habilitar RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Public read stores" ON public.stores;
DROP POLICY IF EXISTS "Admin manage stores" ON public.stores;

-- Política: Qualquer um pode ler lojas
CREATE POLICY "Public read stores" ON public.stores
  FOR SELECT
  USING (true);

-- Política: Usuários autenticados podem gerenciar lojas
CREATE POLICY "Authenticated manage stores" ON public.stores
  FOR ALL
  USING (auth.uid() IS NOT NULL);
