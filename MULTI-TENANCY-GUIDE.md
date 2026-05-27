# 🏪 MULTI-TENANCY - SISTEMA PARA MÚLTIPLAS LOJAS

## ✅ O QUE FOI IMPLEMENTADO

### 1. Banco de Dados Multi-tenant
- **Arquivo:** `multi-tenancy-schema.sql`
- **Tabela `stores`** criada com:
  - Nome, slug, descrição
  - Logo, banner
  - Cores customizáveis (primary, secondary, accent, background)
  - WhatsApp, email, telefone
  - Endereço, cidade, estado, CEP
  - Redes sociais (Instagram, Facebook, TikTok)
  - Status ativo/inativo

- **`store_id` adicionado** em todas as tabelas:
  - products, categories, bowls, acai_types, toppings, sizes
  - combos, combo_items, coupons, banners
  - delivery_areas, business_hours, store_settings, app_settings
  - orders, order_items, order_item_toppings
  - reviews, wishlist, notifications

### 2. Middleware para Identificação de Loja
- **Arquivo:** `lib/middleware.ts`
- Identifica loja pelo subdomínio (ex: `loja.seudominio.com`)
- Adiciona `x-store-slug` nos headers
- Fallback para localhost

### 3. Store Context
- **Arquivo:** `lib/store-context.tsx`
- Busca dados da loja do Supabase
- Aplica cores customizadas via CSS variables
- Hook `useStore()` para acessar dados da loja

### 4. Layout Atualizado
- **Arquivo:** `app/layout.tsx`
- Adicionado `StoreProvider` ao redor do app
- Permite acesso aos dados da loja em toda aplicação

## 🔧 PRÓXIMOS PASSOS

### 1. Atualizar Queries para Filtrar por store_id
Preciso atualizar `lib/actions.ts` e `lib/queries.ts` para:
```typescript
// Exemplo - antes:
const { data } = await supabase.from('products').select('*')

// Exemplo - depois:
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('store_id', store.id) // filtrar por loja
```

### 2. Atualizar Admin Layout para Dados Dinâmicos
- Usar nome, logo e cores da loja no sidebar
- Substituir hardcoded "Açaí da Praia" por `store.name`
- Substituir logo hardcoded por `store.logo_url`

### 3. Atualizar Header/Footer para Dados Dinâmicos
- Nome da loja no header
- Logo dinâmico
- Cores customizadas
- WhatsApp dinâmico

### 4. Criar Página de Setup para Nova Loja
- Formulário para criar nova loja
- Upload de logo e banner
- Seleção de cores
- Configuração inicial

## 📋 STATUS ATUAL

- ✅ Schema multi-tenant criado
- ✅ Middleware implementado
- ✅ Store context criado
- ✅ Layout atualizado
- ⏳ Queries precisam ser atualizadas
- ⏳ UI precisa usar dados dinâmicos
- ⏳ Página de setup precisa ser criada

## 🚀 COMO USAR

### 1. Executar SQL no Supabase
```bash
# Execute o arquivo multi-tenancy-schema.sql no SQL Editor do Supabase
```

### 2. Criar Loja Padrão
O SQL já cria a loja "Açaí da Praia" automaticamente.

### 3. Configurar Subdomínios
Para cada loja, configure:
- `loja1.seudominio.com` → aponta para seu app
- `loja2.seudominio.com` → aponta para seu app

### 4. Atualizar Queries
Preciso atualizar todas as queries em `lib/actions.ts` e `lib/queries.ts` para filtrar por `store_id`.

## ⚠️ IMPORTANTE

Antes de vender o sistema para outras lojas, é necessário:
1. Atualizar TODAS as queries para filtrar por `store_id`
2. Atualizar UI para usar dados dinâmicos (nome, logo, cores)
3. Testar completamente o sistema multi-tenant
4. Criar documentação para novos clientes
