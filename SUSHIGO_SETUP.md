# SushiGo - E-commerce Database Setup

## Banco de Dados Compatível

Este projeto é compatível com:
- **PostgreSQL** (cualquier versión)
- **Supabase** (recomendado para este projeto)
- **Neon**
- **Amazon Aurora PostgreSQL**
- **Amazon Aurora DSQL**

## Arquivos SQL

### 1. Schema Completo
**Arquivo:** `/sql/sushigo-complete-schema.sql`

Contém todas as tabelas, enums, indexes e views necessárias. Execute este arquivo PRIMEIRO:

```bash
# Supabase
psql -h [host] -U [user] -d [database] < sql/sushigo-complete-schema.sql

# Ou via Supabase Studio:
# 1. Acesse SQL Editor
# 2. Cole o conteúdo do arquivo
# 3. Execute (Cmd+Enter)
```

**Tabelas Criadas:**
- `stores` - Configurações da loja
- `categories` - Categorias de produtos
- `products` - Produtos individuais
- `combos` - Combos para festas
- `product_addons` - Molhos e adicionais
- `users` - Clientes
- `addresses` - Endereços de entrega
- `orders` - Pedidos
- `order_items` - Itens do pedido
- `order_item_addons` - Adicionais do item
- `coupons` - Cupons/Promoções
- `delivery_areas` - Áreas de entrega
- `banners` - Banners promocionais
- `business_hours` - Horários
- `app_settings` - Configurações da app

### 2. Migration: Migrar de Açaí para Sushi
**Arquivo:** `/sql/migration-acai-to-sushi.sql`

Execute após a criação do schema para atualizar referências:

```bash
psql -h [host] -U [user] -d [database] < sql/migration-acai-to-sushi.sql
```

**O que faz:**
- Atualiza categorias de açaí para sushi
- Atualiza textos do hero para sushi
- Atualiza banners
- Configura horários (11:00 - 23:30)

## Setup Supabase (Recomendado)

1. **Criar Projeto Supabase**
   - Acesse supabase.com
   - Crie um novo projeto
   - Copie `SUPABASE_URL` e `SUPABASE_ANON_KEY`

2. **Copiar Variáveis de Ambiente**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   SUPABASE_URL=https://seu-projeto.supabase.co
   ```

3. **Executar SQLs**
   - Vá em SQL Editor do Supabase
   - Copie o conteúdo de `/sql/sushigo-complete-schema.sql`
   - Execute
   - Depois execute `/sql/migration-acai-to-sushi.sql`

4. **Ativar RLS (Row Level Security)**
   ```sql
   ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
   ```

## Estrutura Atualizada da Landing Page

```
Home (/)
├── Header (com logo SushiGo, navegação, carrinho, botão WhatsApp)
├── Hero Section (O melhor sushi, onde você estiver)
├── Categories Section (Combos, Sashimis, Niguiris, etc - em linha)
├── Combos Section (10, 20, 30, 40 pessoas)
├── Products Section (Mais pedidos)
├── Promotions Section (Banner vermelho com promoções)
└── Footer (Com formas de pagamento: Visa, Master, Elo, Pix, Dinheiro)
```

## Cores - Design Tokens

```css
--primary: #D62828 (Vermelho SushiGo)
--accent: #FCBF49 (Dourado)
--background: #0A0A0A (Preto profundo)
--card: #141414 (Cinza escuro)
--foreground: #F5F5F5 (Branco off)
```

## Tabelas Importantes para Admin

| Tabela | Uso | Admin Route |
|--------|-----|------------|
| products | Produtos individuais | `/admin/produtos` |
| combos | Combos para festas | `/admin/combos` |
| categories | Categorias | `/admin/categorias` |
| product_addons | Molhos/Adicionais | `/admin/molhos` |
| orders | Pedidos | `/admin/pedidos` |
| coupons | Cupons | `/admin/cupons` |
| delivery_areas | Áreas de entrega | `/admin/entrega` |
| banners | Banners | `/admin/banners` |
| app_settings | Configurações | `/admin/configuracoes` |

## Queries Úteis

**Produtos em Destaque:**
```sql
SELECT * FROM products_with_category 
WHERE is_featured = true 
ORDER BY display_order;
```

**Pedidos Ativos:**
```sql
SELECT * FROM active_orders_summary 
WHERE status != 'cancelado' 
ORDER BY created_at DESC;
```

**Combos Populares:**
```sql
SELECT * FROM combos 
WHERE is_active = true 
ORDER BY display_order 
LIMIT 4;
```

## Próximos Passos

1. ✅ Schema criado (`sushigo-complete-schema.sql`)
2. ✅ Migration executada (`migration-acai-to-sushi.sql`)
3. ⏭️ Seed data com produtos reais
4. ⏭️ RLS policies para segurança
5. ⏭️ Testes de performance
6. ⏭️ Deploy em produção

## Suporte

Para dúvidas sobre o schema, consulte:
- `/sql/sushigo-complete-schema.sql` - Comentários inline
- Documentação Supabase: supabase.com/docs
- PostgreSQL Docs: postgresql.org/docs
