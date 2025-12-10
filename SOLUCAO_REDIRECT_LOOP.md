# Solução para ERR_TOO_MANY_REDIRECTS

## Problema Identificado
Erro `ERR_TOO_MANY_REDIRECTS` ao acessar `https://pensaefaz.com.br/links`

## Causa Raiz
O loop de redirects está acontecendo porque quando você tem `basePath: "/links"` e faz rewrite externo, há uma interação complexa entre:
1. O rewrite externo que envia para `/links/:path*`
2. O basePath do Next.js que espera paths com `/links`
3. Os redirects no middleware que podem estar criando loops

## Soluções Aplicadas

### 1. Middleware Corrigido
O middleware foi ajustado para:
- Detectar corretamente quando a requisição vem com basePath (via rewrite externo)
- Fazer redirects preservando a estrutura correta do URL
- Evitar loops usando `new URL()` para criar URLs absolutos

### 2. Configuração do vercel.json (portfolio2026)
O `vercel.json` do projeto `portfolio2026` DEVE ter:

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

**IMPORTANTE:** O destino DEVE incluir `/links/:path*` porque o projeto linkinbio tem `basePath: "/links"`.

## Próximos Passos

1. **Faça deploy deste projeto (linkinbio)** com as correções no middleware
2. **Verifique o vercel.json do portfolio2026** - certifique-se de que o destino é `/links/:path*` (não `/:path*`)
3. **Faça deploy do portfolio2026** se necessário
4. **Teste novamente** acessando `https://pensaefaz.com.br/links`

## Se o Problema Persistir

Se ainda houver loop de redirects após essas correções, pode ser necessário:
1. Remover temporariamente o `basePath` e ajustar o rewrite para `/:path*`
2. Ou usar uma abordagem diferente de configuração

Mas primeiro, teste com as correções atuais.

