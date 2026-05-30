-- ============================================
-- CRIAR BUCKETS DO SUPABASE STORAGE
-- ============================================
-- Execute este SQL no SQL Editor do Supabase

-- Habilitar extensão de storage
-- (já deve estar habilitada por padrão no Supabase)

-- Criar bucket para produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para vasilhas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bowls', 'bowls', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para toppings/condimentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('toppings', 'toppings', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para coberturas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('sauces', 'sauces', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para reviews/avaliações
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reviews', 'reviews', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para tipos de açaí
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('acai-types', 'acai-types', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para categorias
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('categories', 'categories', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Permitir leitura pública de todos os buckets
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id IN ('products', 'bowls', 'toppings', 'sauces', 'banners', 'logos', 'reviews', 'acai-types', 'categories'));

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('products', 'bowls', 'toppings', 'sauces', 'banners', 'logos', 'reviews', 'acai-types', 'categories')
  AND auth.role() = 'authenticated'
);

-- Permitir update para usuários autenticados
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE USING (
  bucket_id IN ('products', 'bowls', 'toppings', 'sauces', 'banners', 'logos', 'reviews', 'acai-types', 'categories')
  AND auth.role() = 'authenticated'
);

-- Permitir delete para usuários autenticados
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING (
  bucket_id IN ('products', 'bowls', 'toppings', 'sauces', 'banners', 'logos', 'reviews', 'acai-types', 'categories')
  AND auth.role() = 'authenticated'
);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute para verificar se os buckets foram criados
-- SELECT * FROM storage.buckets;
