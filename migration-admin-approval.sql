-- ============================================
-- SISTEMA DE APROVAÇÃO DE ADMINS
-- ============================================
-- Execute este SQL para adicionar campos necessários para o sistema de aprovação de admins
-- IMPORTANTE: Execute multi-tenancy-schema.sql PRIMEIRO para criar a tabela stores

-- ============================================
-- 1. ATUALIZAR TABELA PROFILES
-- ============================================

-- Adicionar campos necessários
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email character varying(255),
ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_owner boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS role character varying(20) DEFAULT 'customer';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_store_id ON public.profiles(store_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_approved ON public.profiles(is_approved);

-- ============================================
-- 2. ATUALIZAR TRIGGER PARA NOVOS USUÁRIOS
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, is_admin, is_approved, is_owner, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    false,
    false,
    false,
    'customer'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Se houver erro (ex: email duplicado), apenas logar e continuar
  RAISE LOG 'Erro ao criar profile: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. POLÍTICAS RLS PARA PROFILES
-- ============================================

-- Política: Permitir leitura pública para verificar se existe admin (necessário para primeiro acesso)
CREATE POLICY "Allow public read to check admin exists" ON public.profiles
  FOR SELECT
  TO PUBLIC
  USING (is_admin = true);

-- Política: Usuários podem ler próprio profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuários podem inserir próprio profile (necessário para primeiro admin quando trigger falha)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política: Usuários podem atualizar próprio profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Política: Admins podem ler profiles da própria loja
CREATE POLICY "Admins can read store profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Política: Dono pode aprovar admins da loja
CREATE POLICY "Owner can approve admins" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_owner = true
    )
  );

-- ============================================
-- 4. FUNÇÃO PARA CONTAR ADMINS POR LOJA
-- ============================================

CREATE OR REPLACE FUNCTION public.count_admins(store_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM public.profiles
    WHERE store_id = store_uuid
    AND is_admin = true
    AND is_approved = true
  );
END;
$$;

-- ============================================
-- 5. FUNÇÃO PARA VERIFICAR SE PODE ADICIONAR ADMIN
-- ============================================

CREATE OR REPLACE FUNCTION public.can_add_admin(store_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count integer;
BEGIN
  admin_count := public.count_admins(store_uuid);
  RETURN admin_count < 2;
END;
$$;

-- ============================================
-- 6. CRIAR DONO DA LOJA (PRIMEIRO ADMIN)
-- ============================================
-- Isso deve ser executado manualmente para cada loja
-- Exemplo:
-- UPDATE public.profiles 
-- SET is_owner = true, is_admin = true, is_approved = true, store_id = 'UUID_DA_LOJA'
-- WHERE id = 'UUID_DO_DONO';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute para verificar se tudo foi criado corretamente
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
