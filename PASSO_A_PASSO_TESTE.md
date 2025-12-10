# Plano de Teste Passo a Passo

## Objetivo
Garantir que ambos os projetos funcionem primeiro nos domínios Vercel, depois ajustar para o domínio personalizado.

## Passo 1: Testar linkinbio diretamente no Vercel

1. **Faça deploy do projeto linkinbio** (sem basePath, como está agora)
2. **Teste acessando diretamente:**
   - `https://linkinbio-ten.vercel.app` → deve funcionar
   - `https://linkinbio-ten.vercel.app/admin` → deve redirecionar para login se não autenticado
   - `https://linkinbio-ten.vercel.app/william-lantelme-filho` → deve mostrar o perfil

**Se funcionar:** ✅ Prosseguir para Passo 2
**Se não funcionar:** ❌ Corrigir problemas primeiro antes de continuar

## Passo 2: Testar rewrite sem basePath

1. **Atualize o vercel.json do projeto portfolio** para:
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
   **IMPORTANTE:** Destino é `/:path*` (SEM `/links`) porque removemos o basePath

2. **Faça deploy do projeto portfolio**

3. **Teste acessando:**
   - `https://pensaefaz.com.br/links` → deve mostrar o linkinbio
   - `https://pensaefaz.com.br/links/william-lantelme-filho` → deve mostrar o perfil
   - `https://pensaefaz.com.br/links/admin` → deve redirecionar para login

**Se funcionar:** ✅ Prosseguir para Passo 3 (adicionar basePath de volta)
**Se não funcionar:** ❌ Verificar logs do Vercel e ajustar

## Passo 3: Adicionar basePath de volta (se necessário)

**Só faça isso se o Passo 2 funcionar perfeitamente!**

1. Adicionar `basePath: "/links"` de volta no `next.config.ts` do linkinbio
2. Ajustar o middleware para lidar com basePath
3. Atualizar o vercel.json do portfolio para incluir `/links` no destino
4. Testar novamente

## Status Atual

- ✅ **linkinbio**: basePath removido temporariamente
- ✅ **middleware**: simplificado para funcionar sem basePath
- ⏳ **Aguardando**: Teste do Passo 1

