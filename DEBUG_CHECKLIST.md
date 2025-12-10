# Checklist de Debug - Problema de Rewrite Vercel

## ✅ Configuração Correta Identificada

### Projeto portfolio2026 (vercel.json)
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
**Status:** ✅ CORRETO

### Projeto linkinbio (next.config.ts)
```typescript
basePath: "/links"
```
**Status:** ✅ CORRETO

## 🔍 Verificações Necessárias

### 1. Verificar URL de Produção do Projeto linkinbio
- [ ] Acesse o dashboard do Vercel
- [ ] Vá para o projeto `linkinbio`
- [ ] Verifique a URL de produção atual
- [ ] Confirme se é `linkinbio-ten.vercel.app` ou se mudou
- [ ] Se mudou, atualize o `vercel.json` do projeto `portfolio2026`

### 2. Testar Acessibilidade Direta
- [ ] Acesse diretamente `https://linkinbio-ten.vercel.app` no navegador
- [ ] Verifique se o projeto está acessível e funcionando
- [ ] Se não estiver acessível, o rewrite não funcionará

### 3. Verificar Deploy
- [ ] Confirme que ambos os projetos estão deployados no Vercel
- [ ] Verifique se o último deploy do `portfolio2026` inclui o `vercel.json` correto
- [ ] Verifique se há erros nos logs de deploy

### 4. Testar Rewrite
- [ ] Acesse `https://pensaefaz.com.br/links` no navegador
- [ ] Verifique qual erro aparece (404, timeout, página em branco, etc.)
- [ ] Abra o DevTools (F12) e verifique a aba Network
- [ ] Veja se há requisições falhando ou sendo bloqueadas

### 5. Verificar Domínios
- [ ] Confirme que `pensaefaz.com.br` está atribuído ao projeto `portfolio2026`
- [ ] Confirme que o projeto `linkinbio` NÃO tem domínios personalizados atribuídos diretamente

## 🐛 Possíveis Problemas

1. **URL de destino incorreto**: O projeto linkinbio pode ter um novo URL de produção
2. **Projeto não acessível**: O projeto linkinbio pode não estar deployado ou estar com problemas
3. **Cache do Vercel**: Pode haver cache antigo que precisa ser limpo
4. **Problema de CORS/Headers**: Pode haver problemas com headers quando fazendo rewrite externo

## 📝 Próximos Passos

Após verificar os itens acima, compartilhe:
1. O URL de produção atual do projeto linkinbio
2. Se o projeto está acessível diretamente
3. Qual erro específico aparece ao acessar `pensaefaz.com.br/links`

