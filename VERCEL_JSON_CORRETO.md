# Configuração CORRETA do vercel.json

## Problema
Loop de redirects (`ERR_TOO_MANY_REDIRECTS`) ao acessar `pensaefaz.com.br/links`

## Solução

Quando você tem `basePath: "/links"` no Next.js, o destino do rewrite externo NO VERCEL **NÃO deve incluir o basePath**.

### Configuração CORRETA no projeto portfolio2026:

```json
{
    "rewrites": [
        {
            "source": "/links/:path*",
            "destination": "https://linkinbio-ten.vercel.app/:path*"
        }
    ]
}
```

**IMPORTANTE:** O destino é `/:path*` (SEM `/links`), não `/links/:path*`

### Como funciona:

1. Requisição: `pensaefaz.com.br/links/alguma-coisa`
2. Rewrite envia para: `linkinbio-ten.vercel.app/alguma-coisa` (sem /links)
3. O projeto linkinbio recebe `/alguma-coisa`
4. Com `basePath: "/links"`, o Next.js trata internamente como `/links/alguma-coisa`

## Ação Necessária

**ATUALIZE o vercel.json do projeto portfolio2026** para usar `/:path*` no destino (sem `/links`).

