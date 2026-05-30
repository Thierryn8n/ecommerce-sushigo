-- ============================================
-- CRIAR BUCKET E POLITICAS PARA CATEGORIAS
-- ============================================

-- 1. Criar bucket categories (se nao existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('categories', 'categories', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- 2. Politica para upload de categorias
CREATE POLICY "Allow authenticated uploads to categories" 
ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'categories');

-- 3. Politica para leitura publica de categorias
CREATE POLICY "Allow public read from categories" 
ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'categories');

-- 4. Politica para update de categorias
CREATE POLICY "Allow authenticated update to categories" 
ON storage.objects
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'categories');

-- 5. Politica para delete de categorias
CREATE POLICY "Allow authenticated delete from categories" 
ON storage.objects
FOR DELETE 
TO authenticated 
USING (bucket_id = 'categories');

-- Verificar buckets existentes
SELECT id, name, public FROM storage.buckets;
