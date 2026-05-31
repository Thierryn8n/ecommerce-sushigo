-- ============================================
-- SINCRONIZAR ENUM COM COLUNAS DO KANBAN
-- ============================================

-- 1. Ver valores atuais do enum
SELECT 'Valores do enum order_status:' as info;
SELECT enumlabel as value
FROM pg_enum
WHERE enumtypid = 'public.order_status'::regtype
ORDER BY enumsortorder;

-- 2. Ver slugs das colunas
SELECT 'Slugs das colunas order_status_columns:' as info;
SELECT slug, name FROM public.order_status_columns ORDER BY display_order;

-- 3. Sincronizar - garantir que todos os slugs das colunas existam no enum
DO $$
DECLARE
  col_record RECORD;
BEGIN
  FOR col_record IN SELECT slug FROM public.order_status_columns
  LOOP
    -- Tentar adicionar cada slug ao enum se não existir
    BEGIN
      EXECUTE format('ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS %L', col_record.slug);
    EXCEPTION WHEN duplicate_object THEN
      -- Valor já existe, ignorar
      NULL;
    END;
  END LOOP;
END $$;

-- 4. Verificar novamente
SELECT 'Valores atualizados do enum:' as info;
SELECT enumlabel as value
FROM pg_enum
WHERE enumtypid = 'public.order_status'::regtype
ORDER BY enumsortorder;
