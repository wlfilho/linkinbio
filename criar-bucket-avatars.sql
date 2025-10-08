-- ============================================
-- CRIAR BUCKET AVATARS E POLÍTICAS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar bucket avatars (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/*']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Permitir leitura pública
CREATE POLICY "Allow public to read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 3. Política: Permitir upload para usuários autenticados
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 4. Política: Permitir atualização para usuários autenticados
CREATE POLICY "Allow users to update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- 5. Política: Permitir deletar para usuários autenticados
CREATE POLICY "Allow users to delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- 6. Verificar se o bucket foi criado
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'avatars';

-- 7. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'objects'
AND policyname LIKE '%avatars%';

