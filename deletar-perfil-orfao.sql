-- ============================================
-- DELETAR PERFIL ÓRFÃO ESPECÍFICO
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Ver o perfil órfão
SELECT 
  p.id,
  p.full_name,
  p.slug,
  p.created_at,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- 2. Deletar perfis órfãos (perfis sem usuário correspondente)
DELETE FROM public.profiles
WHERE id IN (
  SELECT p.id
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  WHERE u.id IS NULL
);

-- 3. Verificar se ainda existem perfis órfãos (deve retornar 0 linhas)
SELECT 
  p.id,
  p.full_name,
  p.slug
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- 4. Ver todos os perfis e usuários
SELECT 
  p.id,
  p.full_name,
  p.slug,
  u.email,
  u.created_at
FROM public.profiles p
INNER JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

