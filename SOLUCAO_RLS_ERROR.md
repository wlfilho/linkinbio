# 🔧 Solução: Erro de Row Level Security (RLS)

## ❌ Erro Encontrado

```
new row violates row-level security policy for table "profiles"
```

## 🎯 Causa do Problema

O usuário está sendo criado no `auth.users`, mas não consegue criar o registro na tabela `profiles` porque:

1. As políticas RLS estão muito restritivas
2. O trigger automático pode não estar funcionando corretamente
3. A função `handle_new_user()` não tem permissões adequadas

## ✅ Solução Passo a Passo

### 1. Executar Script de Correção

1. Acesse: https://supabase.com/dashboard
2. Selecione: **Landing Page Pessoal**
3. Menu lateral: **SQL Editor**
4. Clique em: **New Query**
5. Copie e cole o conteúdo do arquivo: `fix-rls-policy.sql`
6. Clique em: **Run**

### 2. O Que o Script Faz

O script irá:

✅ Remover políticas antigas que podem estar causando conflito
✅ Recriar políticas RLS com permissões corretas
✅ Recriar a função `handle_new_user()` com `SECURITY DEFINER`
✅ Recriar o trigger para auto-criação de perfil
✅ Verificar se tudo foi criado corretamente

### 3. Verificar se Funcionou

Após executar o script, você deve ver no final:

```
4 rows returned
```

Mostrando as 4 políticas criadas:
1. Public profiles are viewable by everyone (SELECT)
2. Users can insert their own profile (INSERT)
3. Users can update their own profile (UPDATE)
4. Users can delete their own profile (DELETE)

### 4. Testar Novamente

1. Volte para: http://localhost:3000/auth/register
2. **Aguarde 1 minuto** (por causa do rate limiting)
3. Tente criar a conta novamente com:
   - Email: wlfilhoju@proton.me
   - Nome: Seu nome
   - Título: (opcional)
   - Senha: (mínimo 6 caracteres)

## 🔍 Diferença da Solução

### ❌ Antes (Problema)

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
-- Sem SECURITY DEFINER
-- Executa com permissões do usuário (limitadas)
```

### ✅ Depois (Corrigido)

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- Executa com permissões do owner
SET search_path = public
LANGUAGE plpgsql
AS $$
-- Agora tem permissões para inserir na tabela profiles
```

## 🐛 Se Ainda Não Funcionar

### Opção 1: Limpar Usuários Órfãos

Se você tentou criar a conta várias vezes, pode haver usuários no auth sem perfil:

```sql
-- Ver usuários sem perfil
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Deletar usuários órfãos (se necessário)
DELETE FROM auth.users 
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL
);
```

### Opção 2: Criar Perfil Manualmente

Se o trigger não funcionar, você pode criar o perfil manualmente após o registro:

```sql
-- Substitua os valores
INSERT INTO public.profiles (id, full_name, slug)
VALUES (
  'id-do-usuario-aqui',
  'Nome Completo',
  'slug-aqui'
);
```

### Opção 3: Desabilitar RLS Temporariamente (NÃO RECOMENDADO)

**Apenas para testes locais:**

```sql
-- CUIDADO: Isso remove a segurança!
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Depois de testar, REABILITE:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## 📊 Verificar Status das Políticas

Execute para ver todas as políticas:

```sql
-- Ver políticas da tabela profiles
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

## 🔐 Verificar Trigger

Execute para ver se o trigger existe:

```sql
-- Ver triggers da tabela auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';
```

## ✅ Checklist de Verificação

Após executar o script, verifique:

- [ ] 4 políticas RLS criadas na tabela `profiles`
- [ ] Função `handle_new_user()` existe com `SECURITY DEFINER`
- [ ] Trigger `on_auth_user_created` existe na tabela `auth.users`
- [ ] RLS está habilitado na tabela `profiles`

## 🎯 Teste Final

1. Execute o script `fix-rls-policy.sql`
2. Aguarde 1 minuto
3. Tente criar uma nova conta
4. Deve funcionar! ✅

---

**Após executar o script, o erro deve ser resolvido! 🎉**

