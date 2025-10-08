# 🔧 Solução: Erro "Email address is invalid"

## ❌ Erro Encontrado

```
AuthApiError: Email address "william@jardinsurbanos.com.br" is invalid
```

## 🎯 Causa do Problema

O Supabase está rejeitando o email porque:
1. O **Email Provider não está habilitado** no projeto
2. Ou há **restrições de domínio** configuradas

## ✅ Solução Passo a Passo

### 1. Acessar Configurações de Autenticação

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **Landing Page Pessoal**
3. No menu lateral, clique em: **Authentication**
4. Clique na aba: **Providers**

### 2. Habilitar Email Provider

1. Procure por **Email** na lista de providers
2. Clique no botão de **editar** (ícone de lápis)
3. Certifique-se de que está **HABILITADO** (toggle verde)
4. Configure as seguintes opções:

```
✅ Enable Email provider
✅ Enable Email Signup (permitir novos cadastros)
⚠️ Confirm email: DESABILITE por enquanto (para testes)
✅ Secure email change: HABILITADO (recomendado)
```

5. Clique em **Save**

### 3. Verificar Restrições de Domínio

1. Ainda em **Authentication** > **Providers** > **Email**
2. Role até a seção **Email Domains**
3. Certifique-se de que:
   - **Não há restrições de domínio** configuradas
   - Ou adicione `jardinsurbanos.com.br` à lista de domínios permitidos

### 4. Verificar Configurações de Email

1. Vá em **Authentication** > **Email Templates**
2. Verifique se os templates estão configurados
3. Se necessário, use os templates padrão

### 5. Testar Novamente

1. Volte para: http://localhost:3000/auth/register
2. Tente criar a conta novamente com:
   - Email: william@jardinsurbanos.com.br
   - Nome: William Filho
   - Senha: (sua senha)

## 🔍 Verificação Adicional

Se o erro persistir, verifique também:

### A. Rate Limiting

O Supabase pode estar bloqueando por excesso de tentativas:

1. Vá em **Authentication** > **Rate Limits**
2. Verifique se não há bloqueios ativos
3. Aguarde alguns minutos e tente novamente

### B. Email Confirmação

Se "Confirm email" estiver habilitado:

1. Você precisará confirmar o email antes de fazer login
2. Verifique sua caixa de entrada
3. Ou desabilite temporariamente para testes

### C. Verificar Logs

1. Vá em **Authentication** > **Logs**
2. Procure por erros relacionados ao seu email
3. Isso pode dar mais detalhes sobre o problema

## 🎯 Configuração Recomendada para Desenvolvimento

Para facilitar os testes, use estas configurações:

```
Authentication > Providers > Email:

✅ Enable Email provider: ON
✅ Enable Email Signup: ON
❌ Confirm email: OFF (para testes)
✅ Secure email change: ON
❌ Email Domains: (deixe vazio ou adicione seu domínio)
```

## 🔄 Alternativa: Usar Email Temporário

Se o problema persistir, teste com um email diferente:

```
Emails para teste:
- teste@gmail.com
- admin@teste.com
- seu-nome@gmail.com
```

## 📸 Captura de Tela das Configurações

Suas configurações devem estar assim:

```
┌─────────────────────────────────────────────────┐
│  Authentication > Providers > Email             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Enable Email provider          [✅ ON]         │
│  Enable Email Signup            [✅ ON]         │
│  Confirm email                  [❌ OFF]        │
│  Secure email change            [✅ ON]         │
│                                                 │
│  Email Domains                                  │
│  └─ (vazio ou jardinsurbanos.com.br)           │
│                                                 │
│  [Save]                                         │
└─────────────────────────────────────────────────┘
```

## ✅ Após Configurar

1. Salve as configurações
2. Aguarde 10-30 segundos para propagar
3. Recarregue a página de registro
4. Tente criar a conta novamente

## 🐛 Se Ainda Não Funcionar

Execute esta query no SQL Editor para verificar as configurações:

```sql
-- Verificar configurações de auth
SELECT * FROM auth.config;

-- Verificar se há usuários bloqueados
SELECT * FROM auth.users WHERE email = 'william@jardinsurbanos.com.br';
```

## 📞 Suporte Adicional

Se o problema persistir:

1. Verifique o console do navegador (F12) para mais detalhes
2. Verifique os logs do Supabase
3. Tente com um email diferente
4. Verifique se o projeto Supabase está ativo

---

**Após seguir estes passos, o erro deve ser resolvido! ✅**

