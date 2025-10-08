-- ============================================
-- LIMPAR USUÁRIOS ÓRFÃOS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Ver todos os usuários sem perfil
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 2. Deletar todos os usuários sem perfil
-- ATENÇÃO: Isso vai deletar os usuários que foram criados mas não têm perfil
DELETE FROM auth.users 
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL
);

-- 3. Verificar se ainda existem usuários órfãos (deve retornar 0 linhas)
SELECT 
  u.id,
  u.email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 4. Ver todos os perfis existentes
SELECT 
  p.id,
  p.full_name,
  p.slug,
  p.created_at,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

