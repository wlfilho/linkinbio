# 🔧 Configuração do Supabase

Este guia irá ajudá-lo a configurar o banco de dados Supabase para a plataforma Link in Bio.

## 📋 Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Projeto criado no Supabase

## 🗄️ Passo 1: Criar o Schema do Banco de Dados

1. Acesse o dashboard do seu projeto no Supabase
2. Navegue até **SQL Editor** no menu lateral
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `supabase-schema.sql`
5. Cole no editor SQL
6. Clique em **Run** para executar o script

O script irá criar:
- ✅ Tabela `profiles`
- ✅ Tabela `social_links`
- ✅ Tabela `custom_buttons`
- ✅ Tabela `leads`
- ✅ Políticas RLS (Row Level Security)
- ✅ Triggers automáticos
- ✅ Bucket de storage `avatars`

## 🪣 Passo 2: Configurar o Storage

1. Navegue até **Storage** no menu lateral
2. Verifique se o bucket `avatars` foi criado
3. Se não foi criado automaticamente, crie manualmente:
   - Clique em **New bucket**
   - Nome: `avatars`
   - Public: ✅ Sim
   - Clique em **Create bucket**

### Configurar Políticas do Storage

Se as políticas não foram criadas automaticamente, adicione manualmente:

1. Clique no bucket `avatars`
2. Vá para a aba **Policies**
3. Adicione as seguintes políticas:

**Policy 1: Public Access (SELECT)**
```sql
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**Policy 2: User Upload (INSERT)**
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: User Update (UPDATE)**
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: User Delete (DELETE)**
```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔐 Passo 3: Configurar Autenticação

1. Navegue até **Authentication** > **Providers**
2. Habilite **Email** provider
3. Configure as opções:
   - ✅ Enable Email provider
   - ✅ Confirm email (opcional)
   - ✅ Secure email change (recomendado)

### Configurar Email Templates (Opcional)

1. Vá para **Authentication** > **Email Templates**
2. Personalize os templates de:
   - Confirmação de email
   - Redefinição de senha
   - Convite de usuário

## 🔑 Passo 4: Obter as Credenciais

1. Navegue até **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public key**: `eyJhbGc...`

3. Cole essas informações no arquivo `.env.local` do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## ✅ Passo 5: Verificar a Instalação

Execute as seguintes queries no SQL Editor para verificar se tudo foi criado corretamente:

### Verificar Tabelas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'social_links', 'custom_buttons', 'leads');
```

Deve retornar 4 tabelas.

### Verificar Políticas RLS
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Deve retornar várias políticas para cada tabela.

### Verificar Storage Bucket
```sql
SELECT * FROM storage.buckets WHERE name = 'avatars';
```

Deve retornar 1 bucket.

## 🐛 Solução de Problemas

### Erro: "relation does not exist"
- Certifique-se de que executou todo o script SQL
- Verifique se está usando o schema `public`

### Erro: "permission denied for table"
- Verifique se as políticas RLS foram criadas corretamente
- Certifique-se de que RLS está habilitado nas tabelas

### Erro ao fazer upload de avatar
- Verifique se o bucket `avatars` existe
- Verifique se o bucket está configurado como público
- Verifique se as políticas de storage foram criadas

### Erro de autenticação
- Verifique se as credenciais no `.env.local` estão corretas
- Certifique-se de que o Email provider está habilitado

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)
- [Authentication](https://supabase.com/docs/guides/auth)

## 🎉 Pronto!

Após seguir todos os passos, seu banco de dados Supabase estará configurado e pronto para uso com a plataforma Link in Bio.

Para testar:
1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Acesse http://localhost:3000
3. Crie uma nova conta
4. Comece a personalizar seu perfil!

---

Se encontrar algum problema, consulte a seção de Solução de Problemas ou abra uma issue no repositório.

