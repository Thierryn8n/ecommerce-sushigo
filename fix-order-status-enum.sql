-- ============================================
-- CORREÇÃO DO ENUM ORDER_STATUS
-- ============================================

-- 1. Ver valores atuais do enum
SELECT enumlabel as status_value
FROM pg_enum
WHERE enumtypid = 'public.order_status'::regtype
ORDER BY enumsortorder;

-- 2. Adicionar valores ausentes ao enum (se não existirem)
DO $$
BEGIN
  -- Adicionar 'pedido_feito' se não existir
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.order_status'::regtype AND enumlabel = 'pedido_feito') THEN
    ALTER TYPE public.order_status ADD VALUE 'pedido_feito';
  END IF;
  
  -- Adicionar 'confirmado' se não existir
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.order_status'::regtype AND enumlabel = 'confirmado') THEN
    ALTER TYPE public.order_status ADD VALUE 'confirmado';
  END IF;
  
  -- Adicionar 'preparando' se não existir
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.order_status'::regtype AND enumlabel = 'preparando') THEN
    ALTER TYPE public.order_status ADD VALUE 'preparando';
  END IF;
  
  -- Adicionar 'saiu_entrega' se não existir
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.order_status'::regtype AND enumlabel = 'saiu_entrega') THEN
    ALTER TYPE public.order_status ADD VALUE 'saiu_entrega';
  END IF;
  
  -- Adicionar 'entregue' se não existir
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.order_status'::regtype AND enumlabel = 'entregue') THEN
    ALTER TYPE public.order_status ADD VALUE 'entregue';
  END IF;
  
  -- Adicionar 'cancelado' se não existir
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.order_status'::regtype AND enumlabel = 'cancelado') THEN
    ALTER TYPE public.order_status ADD VALUE 'cancelado';
  END IF;
END $$;

-- 3. Verificar valores atualizados
SELECT enumlabel as status_value
FROM pg_enum
WHERE enumtypid = 'public.order_status'::regtype
ORDER BY enumsortorder;
