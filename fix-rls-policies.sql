-- ============================================
-- CORREÇÃO DAS POLÍTICAS RLS - RECURSÃO INFINITA
-- ============================================

-- REMOVER TODAS AS POLÍTICAS EXISTENTES DE PROFILES
DROP POLICY IF EXISTS "Admins can read store profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read to check admin exists" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
DROP POLICY IF EXISTS "Owner can approve admins" ON public.profiles;
DROP POLICY IF EXISTS "Public read access" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- ============================================
-- CRIAR POLÍTICAS SIMPLES SEM RECURSÃO
-- ============================================

-- Política 1: Permitir SELECT público para verificar admins (necessário para primeiro acesso)
CREATE POLICY "Public can check admin exists" 
ON public.profiles 
FOR SELECT 
TO PUBLIC 
USING (is_admin = true);

-- Política 2: Usuários podem ler próprio profile
CREATE POLICY "Users can read own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Política 3: Usuários podem inserir próprio profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Política 4: Usuários podem atualizar próprio profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- ============================================
-- REINICIAR RLS
-- ============================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 'Políticas atuais:' as info;
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
