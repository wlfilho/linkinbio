# 🎯 SOLUÇÃO DEFINITIVA - Erro de Chave Duplicada

## 🔍 CAUSA RAIZ IDENTIFICADA

O problema é uma **RACE CONDITION** causada por:

1. ✅ Trigger `on_auth_user_created` cria o perfil automaticamente
2. ✅ API Route também tenta criar o perfil
3. ❌ **CONFLITO**: Ambos tentam inserir o mesmo ID na tabela profiles

**Resultado**: `duplicate key value violates unique constraint "profiles_pkey"`

---

## ✅ SOLUÇÃO: Desabilitar o Trigger

Como a API Route já cria o perfil com permissões de admin (contornando RLS), o trigger não é mais necessário e está causando conflito.

### **Execute Este Script no Supabase:**

```sql
-- Desabilitar o trigger que está causando conflito
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verificar se foi removido (deve retornar 0 linhas)
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth'
AND trigger_name = 'on_auth_user_created';
```

---

## 📋 PASSO A PASSO COMPLETO

### 1. Desabilitar o Trigger

1. Acesse: https://supabase.com/dashboard
2. Selecione: **Landing Page Pessoal**
3. Menu lateral: **SQL Editor** → **New Query**
4. Cole o script acima
5. Clique em: **Run**
6. Deve retornar: "Success. No rows returned"

### 2. Limpar Banco (se necessário)

Se ainda houver usuários órfãos, execute:

```sql
-- Ver usuários sem perfil
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Deletar usuários sem perfil
DELETE FROM auth.users 
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL
);
```

### 3. Testar o Registro

1. Acesse: http://localhost:3000/auth/register
2. Preencha o formulário:
   - Email: wlfilhoju@proton.me
   - Nome: Seu nome
   - Senha: (mínimo 6 caracteres)
3. Clique em **"Criar Conta"** (apenas UMA vez)
4. Aguarde o processamento
5. **Deve funcionar!** ✅

---

## 🔧 O QUE FOI IMPLEMENTADO

### 1. Logs Detalhados na API

A API agora mostra logs completos de cada etapa:

```
=== REGISTRATION START ===
1. Request received for email: xxx
2. Checking if user exists...
3. Generated slug: xxx
4. Creating user in auth.users...
5. Checking if profile was auto-created by trigger...
6. Creating profile manually...
✅ Profile created successfully
=== REGISTRATION COMPLETE (XXXms) ===
```

### 2. Proteção Contra Cliques Duplos

O frontend agora:
- ✅ Verifica se já está processando antes de enviar
- ✅ Mantém o botão desabilitado durante o processo
- ✅ Adiciona logs no console do navegador

### 3. Verificação de Trigger

A API agora:
- ✅ Verifica se o perfil foi criado pelo trigger
- ✅ Só cria manualmente se o trigger não funcionou
- ✅ Aguarda 300ms após criar usuário (evita race condition)

### 4. Rollback Automático

Se algo der errado:
- ✅ Deleta o usuário automaticamente
- ✅ Retorna erro detalhado
- ✅ Não deixa dados inconsistentes

---

## 🎯 POR QUE ISSO RESOLVE?

### Antes (Com Trigger):
```
1. API cria usuário → Trigger dispara → Cria perfil
2. API tenta criar perfil → ❌ ERRO: Perfil já existe!
```

### Depois (Sem Trigger):
```
1. API cria usuário
2. API verifica se perfil existe
3. API cria perfil se necessário
4. ✅ SUCESSO!
```

---

## 📊 FLUXO COMPLETO

```
┌─────────────────────────────────────────────┐
│  1. Usuário preenche formulário            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  2. Frontend chama /api/auth/register      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  3. API verifica se usuário existe         │
│     - Se existe com perfil: ERRO           │
│     - Se existe sem perfil: DELETA         │
│     - Se não existe: CONTINUA              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  4. API cria usuário no auth.users         │
│     (Trigger NÃO dispara - foi removido)   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  5. API aguarda 300ms                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  6. API verifica se perfil foi criado      │
│     (Não foi - trigger removido)           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  7. API cria perfil manualmente            │
│     (Com permissões de admin - ignora RLS) │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  8. ✅ SUCESSO - Usuário e perfil criados  │
└─────────────────────────────────────────────┘
```

---

## 🧪 TESTE APÓS IMPLEMENTAR

### Console do Navegador (F12):
```
Starting registration for: wlfilhoju@proton.me
Calling /api/auth/register...
API response: {success: true, user: {...}}
User created successfully, signing in...
Sign in successful, redirecting...
```

### Terminal do Servidor:
```
=== REGISTRATION START ===
1. Request received for email: wlfilhoju@proton.me
2. Checking if user exists...
✅ No existing user found
3. Generated slug: william-filho
✅ Slug is unique
4. Creating user in auth.users...
✅ User created in auth.users: xxx-xxx-xxx
5. Checking if profile was auto-created by trigger...
6. Creating profile manually...
✅ Profile created successfully
=== REGISTRATION COMPLETE (1234ms) ===
```

---

## ⚠️ IMPORTANTE

Após desabilitar o trigger:
- ✅ Novos usuários serão criados APENAS pela API Route
- ✅ Não haverá mais conflitos de chave duplicada
- ✅ O processo será mais controlado e previsível
- ✅ Logs detalhados facilitam debug

---

## 🎉 RESULTADO ESPERADO

Após executar o script SQL:
1. ✅ Trigger removido
2. ✅ Registro funciona perfeitamente
3. ✅ Sem erros de chave duplicada
4. ✅ Logs claros no console

---

**Execute o script SQL agora e teste o registro! 🚀**

