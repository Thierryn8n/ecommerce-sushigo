-- ============================================
-- TORNAR USUÁRIO EXISTENTE COMO ADMIN
-- ============================================

-- Atualizar o usuário recém-criado para admin
UPDATE public.profiles 
SET is_admin = true, 
    is_approved = true, 
    is_owner = true, 
    role = 'admin'
WHERE email = 'thierry.designer.oficial@gmail.com';

-- Verificar se foi atualizado
SELECT id, email, is_admin, is_approved, is_owner, role
FROM public.profiles
WHERE email = 'thierry.designer.oficial@gmail.com';
