-- ============================================
-- CRIAR BUCKET E POLÍTICAS PARA PRODUCTS
-- ============================================

-- 1. Criar bucket products (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para upload de produtos (nome único)
CREATE POLICY "Allow authenticated uploads to products" 
ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'products');

-- 3. Política para leitura pública
CREATE POLICY "Allow public read from products" 
ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'products');

-- 4. Política para delete (opcional)
CREATE POLICY "Allow authenticated delete from products" 
ON storage.objects
FOR DELETE 
TO authenticated 
USING (bucket_id = 'products');

-- Verificar buckets existentes
SELECT id, name, public FROM storage.buckets;
