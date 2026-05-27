-- Script para configurar tabelas de notificações em tempo real
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de notificações (se não existir)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system', -- 'order', 'system', 'alert', 'status_update'
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela de configurações de notificação do admin
CREATE TABLE IF NOT EXISTS admin_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  sound_enabled BOOLEAN DEFAULT true,
  sound_type TEXT DEFAULT 'default', -- 'default', 'cat', 'bell', 'chime', 'ding', 'pop'
  sound_volume DECIMAL(3,2) DEFAULT 0.7,
  browser_notifications BOOLEAN DEFAULT true,
  vibrate BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_store_id ON notifications(store_id);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 4. Habilitar Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all store notifications" ON notifications;
CREATE POLICY "Admins can view all store notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Políticas RLS para admin_notification_settings
DROP POLICY IF EXISTS "Users can view own settings" ON admin_notification_settings;
CREATE POLICY "Users can view own settings" ON admin_notification_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON admin_notification_settings;
CREATE POLICY "Users can insert own settings" ON admin_notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON admin_notification_settings;
CREATE POLICY "Users can update own settings" ON admin_notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Função para criar notificação quando pedido é criado
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificação para admins (sem user_id específico, store_id é usado)
  INSERT INTO notifications (store_id, title, message, type, order_id)
  VALUES (
    NEW.store_id,
    'Novo Pedido!',
    'Pedido #' || UPPER(SUBSTRING(NEW.id::text, 1, 8)) || ' - R$ ' || NEW.total_amount,
    'order',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para notificar cliente sobre mudança de status
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  status_text TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Mapear status para texto amigável
    status_text := CASE NEW.status
      WHEN 'pendente' THEN 'Aguardando confirmação'
      WHEN 'pedido_feito' THEN 'Pedido recebido'
      WHEN 'confirmado' THEN 'Pedido confirmado'
      WHEN 'em_preparo' THEN 'Em preparação'
      WHEN 'pronto' THEN 'Pronto para entrega'
      WHEN 'saiu_entrega' THEN 'Saiu para entrega'
      WHEN 'entregue' THEN 'Pedido entregue'
      WHEN 'cancelado' THEN 'Pedido cancelado'
      ELSE NEW.status
    END;
    
    -- Notificação para o cliente
    INSERT INTO notifications (user_id, store_id, title, message, type, order_id)
    VALUES (
      NEW.user_id,
      NEW.store_id,
      'Atualização do Pedido',
      'Seu pedido #' || UPPER(SUBSTRING(NEW.id::text, 1, 8)) || ' está: ' || status_text,
      'status_update',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Criar triggers
DROP TRIGGER IF EXISTS on_new_order ON orders;
CREATE TRIGGER on_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- 10. Habilitar Realtime para a tabela notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 11. Habilitar Realtime para a tabela orders (para atualizações em tempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Mensagem de sucesso
SELECT 'Setup de notificações concluído com sucesso!' as status;
