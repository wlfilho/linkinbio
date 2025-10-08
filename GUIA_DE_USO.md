# 📖 Guia de Uso - Link in Bio Platform

Este guia irá ajudá-lo a usar todas as funcionalidades da plataforma.

## 🚀 Primeiros Passos

### 1. Configurar o Supabase

Antes de começar, você precisa configurar o banco de dados Supabase:

1. Siga as instruções no arquivo `SUPABASE_SETUP.md`
2. Execute o script SQL `supabase-schema.sql` no SQL Editor do Supabase
3. Configure as variáveis de ambiente no `.env.local`

### 2. Iniciar o Servidor

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## 👤 Criar Conta

1. Acesse http://localhost:3000
2. Você será redirecionado para a página de login
3. Clique em "Cadastre-se"
4. Preencha o formulário:
   - Email
   - Nome Completo
   - Título/Descrição (opcional)
   - Senha (mínimo 6 caracteres)
   - Confirmar Senha
5. Clique em "Criar Conta"
6. Você será redirecionado para o dashboard

## 🎨 Personalizar Seu Perfil

### Editar Informações Básicas

1. No dashboard, vá para a seção "Perfil"
2. Faça upload de uma foto de perfil:
   - Clique em "Upload Avatar"
   - Selecione uma imagem (JPG, PNG ou WebP, máx 2MB)
3. Edite seu nome completo
4. Edite seu título/descrição
5. Clique em "Salvar Perfil"

### Adicionar Redes Sociais

1. Na seção "Redes Sociais", clique em "Adicionar"
2. Para cada rede social:
   - Selecione a plataforma (YouTube, Instagram, LinkedIn, etc.)
   - Digite o nome de exibição
   - Cole a URL completa
   - Escolha uma cor personalizada (ou use a cor padrão)
3. Para remover uma rede social, clique em "Remover"
4. Clique em "Salvar Redes Sociais"

**Plataformas disponíveis:**
- YouTube
- Instagram
- LinkedIn
- GitHub
- Twitter/X
- Facebook
- TikTok
- Substack

### Adicionar Botões Customizados

1. Na seção "Botões Customizados", clique em "Adicionar"
2. Para cada botão:
   - Digite o título (obrigatório)
   - Digite o subtítulo (opcional)
   - Cole a URL
   - Selecione o tipo de link:
     - **Link Externo**: Abre em nova aba
     - **Email**: Abre o cliente de email
     - **Telefone**: Inicia uma chamada
   - Escolha a cor do ícone
3. Para remover um botão, clique em "Remover"
4. Clique em "Salvar Botões"

## 📊 Gerenciar Leads

### Visualizar Estatísticas

No menu superior, clique em "Leads" para acessar o dashboard de leads.

Você verá 4 cards com estatísticas:
- **Total de Leads**: Todos os leads capturados
- **Hoje**: Leads capturados hoje
- **Esta Semana**: Leads dos últimos 7 dias
- **Este Mês**: Leads dos últimos 30 dias

### Buscar Leads

Use a barra de busca para encontrar leads por:
- Nome
- Email
- WhatsApp

### Filtrar por Período

Use o dropdown de filtro para visualizar leads de:
- Todos os períodos
- Hoje
- Esta Semana
- Este Mês

### Exportar Leads

1. Clique no botão "Exportar CSV"
2. Um arquivo CSV será baixado com todos os leads filtrados
3. O arquivo contém: Nome, Email, WhatsApp e Data

### Deletar Leads

1. Na tabela de leads, clique em "Deletar" na linha do lead
2. Confirme a ação
3. O lead será removido permanentemente

## 🌐 Compartilhar Sua Página

### Visualizar Sua Página Pública

1. No menu superior do admin, clique em "Ver Página"
2. Sua página será aberta em uma nova aba
3. A URL será: `http://localhost:3000/seu-slug`

### Compartilhar o Link

Seu slug é gerado automaticamente a partir do seu nome completo.

Por exemplo:
- Nome: "João Silva"
- Slug: "joao-silva"
- URL: `http://localhost:3000/joao-silva`

Compartilhe esta URL nas suas redes sociais!

## 📱 Página Pública

Sua página pública contém:

### Cabeçalho
- Foto de perfil com indicador online (bolinha verde)
- Nome completo
- Título/descrição

### Redes Sociais
- Ícones circulares coloridos
- Clique para abrir em nova aba

### Botões Customizados
- Cards clicáveis com título e subtítulo
- Ícone indicando o tipo de link
- Efeito hover com animação

### Formulário de Leads
- Título: "Baixe Meu Material Gratuito"
- Campos: Nome, Email, WhatsApp
- Botão: "Quero Receber"
- Após envio, mostra mensagem de sucesso

### Footer
- Copyright com seu nome
- Créditos da plataforma

## 🔐 Segurança

### Dados Protegidos

- Apenas você pode ver seus leads
- Apenas você pode editar seu perfil
- Sua página pública é visível para todos
- Senhas são criptografadas

### Fazer Logout

1. No menu superior do admin, clique em "Sair"
2. Você será redirecionado para a página de login

## 💡 Dicas e Boas Práticas

### Foto de Perfil
- Use uma foto profissional e de alta qualidade
- Formato quadrado funciona melhor
- Tamanho recomendado: 500x500px

### Título/Descrição
- Seja claro e objetivo
- Use emojis para destacar (opcional)
- Exemplos:
  - "Designer Gráfico | Criador de Conteúdo"
  - "🎨 Designer | 📸 Fotógrafo | ✨ Criativo"

### Redes Sociais
- Adicione apenas as redes que você usa ativamente
- Use cores que combinem com sua marca
- Ordene por importância (as primeiras aparecem primeiro)

### Botões Customizados
- Use títulos curtos e diretos
- Adicione subtítulos para mais contexto
- Exemplos:
  - Título: "Meu Portfólio"
  - Subtítulo: "Veja meus trabalhos mais recentes"

### Formulário de Leads
- Personalize o título no código se necessário
- Responda rapidamente aos leads
- Exporte regularmente para backup

## 🐛 Problemas Comuns

### "Erro ao fazer login"
- Verifique se o email e senha estão corretos
- Certifique-se de que criou uma conta primeiro

### "Erro ao atualizar perfil"
- Verifique sua conexão com a internet
- Certifique-se de que o Supabase está configurado corretamente

### "Erro ao fazer upload do avatar"
- Verifique o tamanho do arquivo (máx 2MB)
- Use apenas JPG, PNG ou WebP
- Certifique-se de que o bucket "avatars" existe no Supabase

### "Página não encontrada"
- Verifique se o slug está correto
- Certifique-se de que o perfil foi criado

## 📞 Suporte

Se você encontrar algum problema:

1. Verifique o console do navegador (F12)
2. Verifique os logs do servidor
3. Consulte a documentação do Supabase
4. Abra uma issue no repositório

## 🎉 Pronto para Produção

Quando estiver pronto para colocar em produção:

1. Configure um domínio personalizado
2. Atualize as variáveis de ambiente
3. Execute `npm run build`
4. Faça deploy no Vercel, Netlify ou outro serviço
5. Configure o DNS do seu domínio

---

**Aproveite sua nova plataforma Link in Bio! 🚀**

