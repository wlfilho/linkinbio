-- ============================================
-- VERIFICAR E DESABILITAR TRIGGER
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Ver todos os triggers na tabela auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';

-- 2. Ver a função do trigger
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 3. DESABILITAR o trigger temporariamente
-- Isso evita que o trigger tente criar o perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Verificar se o trigger foi removido (deve retornar 0 linhas)
SELECT 
  trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth'
AND trigger_name = 'on_auth_user_created';

-- 5. Ver todos os perfis existentes
SELECT 
  p.id,
  p.full_name,
  p.slug,
  p.created_at,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- 6. Ver todos os usuários
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- IMPORTANTE: 
-- Após desabilitar o trigger, a criação do perfil
-- será feita APENAS pela API Route, evitando
-- conflitos de chave duplicada.
-- ============================================

