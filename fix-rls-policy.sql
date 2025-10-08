-- ============================================
-- FIX: Row Level Security Policy para Profiles
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- 2. Recriar políticas com permissões corretas
-- Política de SELECT (visualização pública)
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

-- Política de INSERT (permitir criação durante registro)
CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Política de UPDATE (permitir atualização do próprio perfil)
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política de DELETE (permitir deletar próprio perfil)
CREATE POLICY "Users can delete their own profile" 
  ON profiles FOR DELETE 
  USING (auth.uid() = id);

-- 3. Verificar se o trigger existe e está correto
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Recriar função de trigger com permissões corretas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- IMPORTANTE: Executa com permissões do owner
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'slug', NEW.id::text)
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log do erro mas não falha o registro
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Verificar se RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Deve retornar 4 políticas:
-- 1. Public profiles are viewable by everyone (SELECT)
-- 2. Users can insert their own profile (INSERT)
-- 3. Users can update their own profile (UPDATE)
-- 4. Users can delete their own profile (DELETE)

