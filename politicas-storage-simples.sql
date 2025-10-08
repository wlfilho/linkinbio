-- ============================================
-- POLÍTICAS SIMPLES E FUNCIONAIS PARA STORAGE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. REMOVER todas as políticas antigas
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;

-- 2. CRIAR políticas SIMPLES que funcionam

-- Leitura pública (qualquer um pode ver)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Upload (usuários autenticados podem fazer upload)
CREATE POLICY "Authenticated can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Atualização (usuários autenticados podem atualizar)
CREATE POLICY "Authenticated can update avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Deletar (usuários autenticados podem deletar)
CREATE POLICY "Authenticated can delete avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- 3. Garantir que o bucket é público
UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';

-- 4. Verificar políticas
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%avatars%';

-- Deve retornar 4 políticas

