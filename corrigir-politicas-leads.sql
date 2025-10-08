-- ============================================
-- CORRIGIR POLÍTICAS RLS DA TABELA LEADS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Ver políticas atuais da tabela leads
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'leads';

-- 2. REMOVER políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
DROP POLICY IF EXISTS "Public can insert leads" ON leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;

-- 3. CRIAR políticas corretas

-- Política 1: QUALQUER PESSOA pode inserir leads (público)
-- Isso é essencial para o formulário funcionar sem autenticação
CREATE POLICY "Anyone can submit leads"
ON leads FOR INSERT
TO public
WITH CHECK (true);

-- Política 2: Usuários autenticados podem ver APENAS seus próprios leads
CREATE POLICY "Users can view own leads"
ON leads FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Política 3: Usuários autenticados podem deletar APENAS seus próprios leads
CREATE POLICY "Users can delete own leads"
ON leads FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 4. Verificar se RLS está habilitado
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 5. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'leads'
ORDER BY policyname;

-- Deve retornar 3 políticas:
-- 1. Anyone can submit leads (INSERT, public)
-- 2. Users can view own leads (SELECT, authenticated)
-- 3. Users can delete own leads (DELETE, authenticated)

-- 6. Testar inserção (simulação)
-- Este comando deve funcionar sem autenticação
-- SELECT 'Test: Public can insert' as test;

