# 🔧 Solução: Erro no Formulário de Leads

## 🔍 PROBLEMA IDENTIFICADO

O formulário de leads na página pública está falhando porque:

❌ **Usuários não autenticados (público) não podem inserir dados na tabela `leads`**

Isso acontece porque as políticas RLS (Row Level Security) estão bloqueando inserções de visitantes anônimos.

---

## ✅ SOLUÇÃO: Permitir Inserção Pública

A tabela `leads` precisa permitir que **qualquer pessoa** (autenticada ou não) possa inserir dados, mas apenas o **dono do perfil** pode visualizar e gerenciar esses leads.

---

## 📋 PASSO A PASSO

### **1. Executar Script SQL no Supabase**

1. Acesse: https://supabase.com/dashboard
2. Selecione: **Landing Page Pessoal**
3. Menu lateral: **SQL Editor** → **New Query**
4. Cole o script abaixo:

```sql
-- REMOVER políticas antigas
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
DROP POLICY IF EXISTS "Public can insert leads" ON leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;

-- CRIAR políticas corretas

-- Política 1: QUALQUER PESSOA pode inserir leads (público)
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

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Verificar políticas criadas
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'leads'
ORDER BY policyname;
```

5. Clique em: **Run**
6. Deve retornar: 3 políticas criadas

---

### **2. Testar o Formulário**

1. Acesse sua página pública: http://localhost:3000/[seu-slug]
2. Role até o formulário **"📥 Baixe Meu Material Gratuito"**
3. Preencha:
   - Nome Completo: "João Silva"
   - Email: "joao@teste.com"
   - WhatsApp: "(11) 99999-9999"
4. Clique em: **"Quero Receber"**
5. **Deve funcionar agora!** ✅

---

### **3. Verificar Logs no Console**

Abra o console do navegador (F12) e você verá:

```
=== LEAD SUBMISSION START ===
User ID: xxx-xxx-xxx
Form data: {fullName: "João Silva", email: "joao@teste.com", ...}
Inserting lead data: {...}
Insert response: {data: [...], error: null}
✅ Lead submitted successfully: [...]
=== LEAD SUBMISSION END ===
```

---

### **4. Ver o Lead no Dashboard**

1. Faça login: http://localhost:3000/auth/login
2. Vá para: **Leads** (menu superior)
3. Você deve ver o lead que acabou de criar:
   - Nome: João Silva
   - Email: joao@teste.com
   - WhatsApp: (11) 99999-9999
   - Data: Hoje

---

## 🎯 POLÍTICAS CRIADAS

| Política | Operação | Quem Pode | Descrição |
|----------|----------|-----------|-----------|
| **Anyone can submit leads** | INSERT | `public` | Qualquer visitante pode enviar formulário |
| **Users can view own leads** | SELECT | `authenticated` | Apenas o dono vê seus leads |
| **Users can delete own leads** | DELETE | `authenticated` | Apenas o dono pode deletar |

---

## 🔒 SEGURANÇA

### ✅ **O Que Está Protegido:**

1. ✅ Visitantes **podem** enviar leads (necessário para o formulário funcionar)
2. ✅ Visitantes **NÃO podem** ver leads de outros usuários
3. ✅ Visitantes **NÃO podem** deletar leads
4. ✅ Apenas o dono do perfil pode ver e gerenciar seus próprios leads

### ⚠️ **Proteção Contra Spam:**

Para evitar spam, você pode adicionar:
- Rate limiting no Supabase
- Captcha (Google reCAPTCHA)
- Validação de email
- Honeypot fields

---

## 🧪 TESTE COMPLETO

### **Teste 1: Visitante Anônimo**
1. Abra aba anônima (Ctrl+Shift+N)
2. Acesse: http://localhost:3000/[seu-slug]
3. Preencha e envie o formulário
4. ✅ Deve funcionar

### **Teste 2: Ver Leads no Dashboard**
1. Faça login como dono do perfil
2. Vá para: Leads
3. ✅ Deve ver o lead enviado

### **Teste 3: Outro Usuário Não Vê**
1. Crie outra conta
2. Vá para: Leads
3. ✅ Não deve ver leads de outros usuários

---

## 📊 FLUXO COMPLETO

```
┌─────────────────────────────────────────────┐
│  1. Visitante acessa página pública        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  2. Preenche formulário de leads           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  3. Clica em "Quero Receber"               │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  4. Frontend chama supabase.from("leads")  │
│     .insert({...})                          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  5. Supabase verifica política RLS         │
│     "Anyone can submit leads" = true       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  6. ✅ Lead inserido com sucesso           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  7. Mensagem de sucesso exibida            │
│     "Obrigado! Você receberá o material"   │
└─────────────────────────────────────────────┘
```

---

## 🐛 SE AINDA DER ERRO

### **Erro: "new row violates row-level security policy"**

**Solução**: Execute o script SQL novamente e verifique se a política foi criada:

```sql
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'leads'
AND policyname = 'Anyone can submit leads';
```

Deve retornar 1 linha.

---

### **Erro: "column does not exist"**

**Solução**: Verifique se a tabela `leads` tem as colunas corretas:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;
```

Deve ter: `id`, `user_id`, `full_name`, `email`, `whatsapp`, `created_at`

---

### **Erro: "relation does not exist"**

**Solução**: A tabela `leads` não foi criada. Execute o script original:

```sql
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎉 RESULTADO ESPERADO

### **Console do Navegador:**
```
=== LEAD SUBMISSION START ===
User ID: abc-123-def
Form data: {fullName: "João Silva", ...}
Inserting lead data: {...}
Insert response: {data: [{...}], error: null}
✅ Lead submitted successfully
=== LEAD SUBMISSION END ===
```

### **Mensagem na Tela:**
```
✅ Cadastro Realizado!
Obrigado pelo seu interesse. 
Em breve você receberá o material gratuito.
```

### **Dashboard de Leads:**
```
📊 Estatísticas
Total: 1 | Hoje: 1 | Semana: 1 | Mês: 1

📋 Leads Capturados
┌──────────────┬────────────────┬──────────────┬────────────┐
│ Nome         │ Email          │ WhatsApp     │ Data       │
├──────────────┼────────────────┼──────────────┼────────────┤
│ João Silva   │ joao@teste.com │ (11) 99999...│ Hoje 14:30 │
└──────────────┴────────────────┴──────────────┴────────────┘
```

---

## 📁 ARQUIVOS MODIFICADOS

1. ✅ **`components/profile/LeadForm.tsx`** - Logs detalhados adicionados
2. ✅ **`corrigir-politicas-leads.sql`** - Script SQL para corrigir políticas
3. ✅ **`SOLUCAO_FORMULARIO_LEADS.md`** - Este arquivo (documentação)

---

**Execute o script SQL e teste o formulário! Deve funcionar perfeitamente agora! 🚀**

