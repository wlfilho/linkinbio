# Configuração Multi-Projeto Vercel com Rewrites

## Objetivo
Configurar dois projetos separados (portfolio e linkinbio) para funcionarem no mesmo domínio `pensaefaz.com.br`:
- **Portfolio**: na raiz (`pensaefaz.com.br`)
- **LinkInBio**: no caminho `/links` (`pensaefaz.com.br/links`)

---

## Estrutura da Solução

### Arquitetura
```
pensaefaz.com.br (Portfolio)
├── / → Projeto Portfolio
└── /links/* → Rewrite para Projeto LinkInBio
```

### Projetos
1. **Portfolio** (projeto principal)
   - Domínio: `pensaefaz.com.br`
   - Responsável por fazer o rewrite para `/links/*`

2. **LinkInBio** (projeto secundário)
   - URL Vercel: `linkinbio-ten.vercel.app`
   - Configurado com `basePath: "/links"`

---

## Configurações Implementadas

### 1. Projeto LinkInBio

#### `next.config.ts`
```typescript
const nextConfig: NextConfig = {
  // Configura o projeto para funcionar sob o caminho /links
  basePath: "/links",
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cieqpmtoewwsiiuxmqes.supabase.co",
      },
    ],
  },
};
```

**O que isso faz:**
- Todas as rotas do Next.js são automaticamente prefixadas com `/links`
- Assets estáticos (CSS, JS) são servidos com o prefixo `/links`
- Links internos são automaticamente ajustados

#### `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/links/:path*"
    }
  ]
}
```

**O que isso faz:**
- Quando acessar `linkinbio-ten.vercel.app` diretamente, redireciona para `linkinbio-ten.vercel.app/links`
- Facilita testes durante desenvolvimento

### 2. Projeto Portfolio

#### `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/links/:path*",
      "destination": "https://linkinbio-ten.vercel.app/links/:path*"
    }
  ]
}
```

**O que isso faz:**
- Quando alguém acessa `pensaefaz.com.br/links/*`, o Vercel faz um proxy para `linkinbio-ten.vercel.app/links/*`
- Mantém o domínio `pensaefaz.com.br` na barra de endereço

---

## Como Funciona

### Fluxo de Requisição

1. **Usuário acessa:** `pensaefaz.com.br/links`
2. **Portfolio (Vercel):** Detecta o rewrite e faz proxy para `linkinbio-ten.vercel.app/links`
3. **LinkInBio (Next.js):** Recebe a requisição em `/links` e serve a página inicial
4. **Next.js:** Como tem `basePath: "/links"`, todos os assets e rotas funcionam corretamente

### Exemplos de Rotas

| URL Acessada | Rewrite Para | Next.js Serve |
|--------------|--------------|---------------|
| `pensaefaz.com.br/links` | `linkinbio-ten.vercel.app/links` | Página inicial |
| `pensaefaz.com.br/links/auth/login` | `linkinbio-ten.vercel.app/links/auth/login` | Página de login |
| `pensaefaz.com.br/links/admin` | `linkinbio-ten.vercel.app/links/admin` | Admin panel |
| `pensaefaz.com.br/links/_next/static/...` | `linkinbio-ten.vercel.app/links/_next/static/...` | Assets estáticos |

---

## Próximos Passos

### 1. Deploy do LinkInBio
```bash
# No diretório do projeto LinkInBio
git add .
git commit -m "feat: configure basePath for /links route"
git push
```

### 2. Verificar Deploy no Vercel
- Acesse o dashboard do projeto LinkInBio no Vercel
- Aguarde o deploy completar
- Teste acessando: `linkinbio-ten.vercel.app/links`

### 3. Testar Integração
Após o deploy, teste as seguintes URLs:

- ✅ `pensaefaz.com.br` → Portfolio
- ✅ `pensaefaz.com.br/links` → LinkInBio home
- ✅ `pensaefaz.com.br/links/auth/login` → Login
- ✅ `pensaefaz.com.br/links/admin` → Admin
- ✅ Imagens e assets carregando corretamente

---

## Troubleshooting

### Problema: Rotas ainda não funcionam
**Solução:** Certifique-se de que o deploy do LinkInBio foi concluído após adicionar o `basePath`

### Problema: Assets não carregam
**Solução:** Limpe o cache do Vercel:
1. Vá para o projeto no Vercel Dashboard
2. Settings → General → Clear Cache
3. Faça um novo deploy

### Problema: Redirect loop
**Solução:** Verifique se não há conflito entre os rewrites do Portfolio e do LinkInBio

### Problema: 404 em rotas específicas
**Solução:** Verifique se o middleware do Next.js não está bloqueando as rotas

---

## Vantagens desta Abordagem

1. ✅ **Projetos independentes:** Cada um com seu próprio repositório e pipeline de deploy
2. ✅ **Domínio unificado:** Tudo sob `pensaefaz.com.br`
3. ✅ **Fácil manutenção:** Mudanças em um projeto não afetam o outro
4. ✅ **Performance:** Vercel Edge Network faz o proxy de forma eficiente
5. ✅ **Escalabilidade:** Fácil adicionar mais projetos no futuro (ex: `/blog`, `/shop`)

---

## Alternativas Consideradas

### Monorepo
- ❌ Mais complexo de gerenciar
- ❌ Deploys acoplados
- ✅ Compartilhamento de código mais fácil

### Subdomínios
- ✅ Mais simples de configurar
- ❌ URLs diferentes (`links.pensaefaz.com.br`)
- ❌ Requer configuração DNS adicional

### Proxy Reverso (Nginx/Cloudflare)
- ✅ Controle total
- ❌ Infraestrutura adicional
- ❌ Mais complexo de manter

---

## Notas Importantes

1. **Variáveis de Ambiente:** Certifique-se de que as variáveis de ambiente do LinkInBio estão configuradas no Vercel
2. **Autenticação:** Cookies e sessões funcionarão normalmente, pois o domínio permanece o mesmo
3. **SEO:** Os crawlers verão `pensaefaz.com.br/links/*` como parte do mesmo domínio
4. **Analytics:** Configure o tracking para diferenciar entre Portfolio e LinkInBio se necessário

---

## Checklist Final

- [ ] Deploy do LinkInBio com `basePath` configurado
- [ ] Testar `pensaefaz.com.br/links`
- [ ] Testar `pensaefaz.com.br/links/auth/login`
- [ ] Verificar imagens carregando
- [ ] Testar navegação entre páginas
- [ ] Verificar autenticação funcionando
- [ ] Testar admin panel
- [ ] Verificar responsividade mobile
- [ ] Testar em diferentes browsers
