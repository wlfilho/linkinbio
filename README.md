# 🔗 Link in Bio Platform

Uma plataforma completa estilo LinkTree construída com Next.js 14+, React, Tailwind CSS e Supabase.

## ✨ Funcionalidades

### Página Pública
- 📸 Foto de perfil com indicador de status online
- 👤 Nome e título/descrição personalizados
- 🌐 Ícones de redes sociais com cores customizáveis
- 🔘 Botões de links customizados
- 📝 Formulário de captura de leads

### Painel Administrativo
- ✏️ Edição completa de perfil
- 📤 Upload de avatar
- 🔗 Gerenciamento de redes sociais
- 🎨 Customização de cores
- 📊 Gerenciamento de botões personalizados
- 📈 Dashboard de leads com estatísticas
- 🔍 Busca e filtros de leads
- 📥 Exportação de leads para CSV

## 🚀 Tecnologias

- **Next.js 14+** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Backend (Auth, Database, Storage)
- **Lucide React** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Sonner** - Notificações toast

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente no arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. Execute o script SQL no Supabase:
   - Acesse o SQL Editor no dashboard do Supabase
   - Execute o conteúdo do arquivo `supabase-schema.sql`

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse http://localhost:3000

## 🗄️ Estrutura do Banco de Dados

### Tabelas
- **profiles** - Informações do perfil do usuário
- **social_links** - Links de redes sociais
- **custom_buttons** - Botões personalizados
- **leads** - Leads capturados

### Storage
- **avatars** - Bucket para armazenar fotos de perfil

## 🔐 Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Autenticação via Supabase Auth
- Middleware de proteção de rotas
- Validação server-side e client-side

## 📱 Responsividade

- Design mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Interface adaptativa para todos os dispositivos

## 🎨 Personalização

### Cores Padrão
- Primary: #0891B2 (Cyan)
- Background: #F3F4F6 (Gray)
- Card: #FFFFFF (White)
- Text: #1F2937 (Dark Gray)
- Border: #E5E7EB (Light Gray)

Você pode personalizar as cores no arquivo `tailwind.config.ts`.

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para suporte, entre em contato através do email ou abra uma issue no repositório.

---

Desenvolvido com ❤️ usando Next.js e Supabase

