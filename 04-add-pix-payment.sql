-- ============================================
-- 04 - ADICIONAR FUNCIONALIDADE PIX
-- Script para configurar pagamento PIX no Supabase
-- ============================================

-- 1. Verificar se a tabela store_settings existe, se não, criar
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(store_id, key)
);

-- 2. Adicionar comentário na tabela
COMMENT ON TABLE store_settings IS 'Configurações da loja (chave-valor)';

-- 3. Criar índice para busca rápida por chave
CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(key);
CREATE INDEX IF NOT EXISTS idx_store_settings_store_id ON store_settings(store_id);

-- 4. Verificar colunas na tabela orders (garantir que payment_status existe)
DO $$
BEGIN
  -- Adicionar payment_method se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20) DEFAULT 'pix';
  END IF;
  
  -- Adicionar payment_status se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
    ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pendente';
  END IF;
END $$;

-- 5. Adicionar valores permitidos para payment_method (constraint check)
-- Nota: Se já existir dados, essa constraint pode falhar. Remova se necessário.
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_payment_method;
-- ALTER TABLE orders ADD CONSTRAINT check_payment_method 
--   CHECK (payment_method IN ('pix', 'card', 'cash'));

-- 6. Adicionar valores permitidos para payment_status
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_payment_status;
-- ALTER TABLE orders ADD CONSTRAINT check_payment_status 
--   CHECK (payment_status IN ('pendente', 'pago', 'cancelado', 'reembolsado'));

-- 7. Criar política RLS para store_settings (permitir leitura pública)
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON store_settings;
CREATE POLICY "Permitir leitura pública de configurações" 
  ON store_settings FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita apenas para admins" ON store_settings;
CREATE POLICY "Permitir escrita apenas para admins" 
  ON store_settings FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM store_admins WHERE is_approved = true));

-- 8. Inserir chave PIX de exemplo (substitua pelo valor real após rodar)
-- Descomente e modifique com o store_id correto:
-- INSERT INTO store_settings (store_id, key, value, description)
-- VALUES (
--   'SEU-STORE-ID-AQUI',  -- Substitua pelo UUID da sua loja
--   'pix_key', 
--   'sua-chave-pix-aqui@email.com',  -- Substitua pela sua chave PIX
--   'Chave PIX para pagamentos'
-- )
-- ON CONFLICT (store_id, key) 
-- DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ============================================
-- INSTRUÇÕES:
-- ============================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Após executar, substitua 'SEU-STORE-ID-AQUI' pelo UUID da loja
-- 3. Substitua 'sua-chave-pix-aqui@email.com' pela sua chave PIX real
-- 4. Execute a query de INSERT (linha 68-76) com os valores corretos
-- 5. No painel admin, vá em Configurações → Contato para editar a chave
-- ============================================
