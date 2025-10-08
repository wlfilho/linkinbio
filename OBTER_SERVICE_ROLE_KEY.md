# 🔑 Como Obter a Service Role Key do Supabase

## 📋 Passo a Passo

### 1. Acessar o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **Landing Page Pessoal**

### 2. Ir para Configurações de API

1. No menu lateral, clique em: **Settings** (ícone de engrenagem)
2. Clique em: **API**

### 3. Encontrar a Service Role Key

Role a página até encontrar a seção **Project API keys**

Você verá duas chaves:

```
┌─────────────────────────────────────────────────┐
│  Project API keys                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  anon public                                    │
│  └─ eyJhbGc... (já temos essa)                 │
│                                                 │
│  service_role secret                            │
│  └─ eyJhbGc... (PRECISAMOS DESSA!)             │
│     [Reveal] [Copy]                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4. Copiar a Service Role Key

1. Clique em **Reveal** ao lado de `service_role`
2. Clique em **Copy** para copiar a chave
3. A chave começa com `eyJhbGc...`

### 5. Adicionar ao .env.local

1. Abra o arquivo `.env.local` no seu projeto
2. Adicione uma nova linha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cieqpmtoewwsiiuxmqes.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZXFwbXRvZXd3c2lpdXhtcWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY2MDIsImV4cCI6MjA3NTUzMjYwMn0.OdgTloEoKYyUxpwphUtujf9C77IYoir8I1HZH9E-fh0
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_A_CHAVE_QUE_VOCE_COPIOU
```

3. Salve o arquivo

### 6. Reiniciar o Servidor

1. No terminal, pressione `Ctrl+C` para parar o servidor
2. Execute novamente: `npm run dev`
3. Aguarde o servidor iniciar

### 7. Testar o Registro

1. Acesse: http://localhost:3000/auth/register
2. Preencha o formulário
3. Clique em "Criar Conta"
4. Deve funcionar agora! ✅

---

## ⚠️ IMPORTANTE: Segurança

A **Service Role Key** é uma chave **SECRETA** e tem **permissões totais** no banco de dados!

### ✅ Boas Práticas:

1. **NUNCA** compartilhe essa chave
2. **NUNCA** faça commit dela no Git
3. **NUNCA** use ela no código client-side
4. Use apenas em:
   - Arquivos `.env.local` (já está no .gitignore)
   - API Routes do Next.js (server-side)
   - Scripts de backend

### 🔒 Verificar .gitignore

Certifique-se de que o `.gitignore` contém:

```
.env*.local
.env
```

Isso garante que suas chaves não sejam enviadas para o Git.

---

## 🎯 Resumo Visual

```
Supabase Dashboard
    ↓
Settings > API
    ↓
Project API keys
    ↓
service_role [Reveal] [Copy]
    ↓
Cole no .env.local
    ↓
Reinicie o servidor
    ↓
Teste o registro
    ↓
✅ Funcionando!
```

---

## 🐛 Se Não Funcionar

### Erro: "SUPABASE_SERVICE_ROLE_KEY is not defined"

**Solução**: 
1. Verifique se adicionou a chave no `.env.local`
2. Reinicie o servidor (`Ctrl+C` e `npm run dev`)

### Erro: "Invalid API key"

**Solução**:
1. Verifique se copiou a chave completa
2. Certifique-se de que não há espaços extras
3. A chave deve começar com `eyJhbGc...`

### Erro: "Failed to create user"

**Solução**:
1. Verifique se o Email Provider está habilitado no Supabase
2. Vá em Authentication > Providers > Email
3. Certifique-se de que está ON

---

**Após adicionar a Service Role Key e reiniciar o servidor, o registro deve funcionar! 🚀**

