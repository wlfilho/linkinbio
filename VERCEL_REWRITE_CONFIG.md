# Configuração de Rewrite Vercel

## Problema
O projeto `linkinbio` deve ser acessível em `pensaefaz.com.br/links` através de um rewrite externo do projeto `portfolio2026`.

## Configuração Necessária no Projeto portfolio2026

O arquivo `vercel.json` na raiz do projeto `portfolio2026` deve conter:

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

**IMPORTANTE:** O destino DEVE incluir `/links/:path*` porque este projeto tem `basePath: "/links"` configurado. Quando você faz um rewrite externo, o path que chega no destino é exatamente o que você especifica. Como o projeto tem `basePath: "/links"`, ele espera receber paths que começam com `/links`.

## Verificações Necessárias

1. **Verifique o URL de produção** do projeto linkinbio no Vercel:
   - Acesse o dashboard do Vercel
   - Vá para o projeto `linkinbio`
   - Verifique a URL de produção (pode ter mudado de `linkinbio-ten.vercel.app`)
   - Use essa URL exata no `vercel.json` do projeto `portfolio2026`

2. **O domínio `pensaefaz.com.br`** deve estar atribuído ao projeto `portfolio2026` (não ao linkinbio)

3. **Este projeto (`linkinbio`) já está configurado corretamente** com `basePath: "/links"` no `next.config.ts`

## Como Funciona

- Quando alguém acessa `pensaefaz.com.br/links/alguma-coisa`:
  1. O projeto `portfolio2026` recebe a requisição em `/links/alguma-coisa`
  2. O rewrite envia para `linkinbio-ten.vercel.app/links/alguma-coisa` (COM /links)
  3. O projeto `linkinbio` recebe `/links/alguma-coisa`
  4. Com `basePath: "/links"`, o Next.js remove o basePath e processa `/alguma-coisa` internamente

## Teste

Após configurar corretamente:
- `https://pensaefaz.com.br` → deve mostrar o portfolio2026
- `https://pensaefaz.com.br/links` → deve mostrar o linkinbio (via rewrite)
- `https://pensaefaz.com.br/links/william-lantelme-filho` → deve mostrar o perfil específico

