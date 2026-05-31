# ============================================
# ORDEM DE EXECUCAO DOS SCRIPTS SQL
# ============================================

Execute os scripts na seguinte ordem no SQL Editor do Supabase:

## PASSO 1: Criar Tabelas (Obrigatório)
Arquivo: `01-tables.sql`
- Cria todas as tabelas do sistema
- Inclui: stores, categories, products, combos, orders, etc.

## PASSO 2: Criar Índices (Obrigatório)
Arquivo: `02-indexes.sql`
- Otimiza buscas com índices
- Melhora performance das queries

## PASSO 3: Configurar RLS (Obrigatório)

**ATENÇÃO: Use o arquivo correto baseado no schema escolhido:**

### Se usou `01-tables.sql` (schema com customers):
Arquivo: `03-rls-policies.sql`
- Usa tabela `customers` com `user_id`
- Usa `customer_addresses` e `customer_id` em orders

### Se usou `sushigo-complete-schema.sql` (schema com users):
Arquivo: `03-rls-policies-complete.sql` ⭐ **USE ESTE!**
- Usa tabela `users` com `id` direto
- Usa `addresses` e `user_id` em orders

**Erro comum:** Usar `03-rls-policies.sql` quando executou `sushigo-complete-schema.sql` causa erro "column user_id does not exist" porque os schemas são diferentes!

## PASSO 4: Inserir Dados Iniciais (Opcional)
Arquivo: `04-seed-data.sql`
- Categorias padrão
- Produtos de exemplo
- Configurações iniciais

## PASSO 5: Funções e Triggers (Obrigatório)
Arquivo: `05-functions.sql`
- Triggers para updated_at
- Funções auxiliares
- Buckets do Storage

## PASSO 6: Configurar PIX (Opcional)
Arquivo: `04-add-pix-payment.sql`
- Cria tabela store_settings
- Adiciona suporte a pagamento PIX
- Configura políticas RLS para PIX

## PASSO 7: Migração Açaí → Sushi (Se migrando)
Arquivo: `migration-acai-to-sushi.sql`
- Atualiza textos/categorias
- Só execute se estiver migrando do tema açaí

## PASSO 8: Schema Completo (Alternativa)
Arquivo: `sushigo-complete-schema.sql`
- Tem TUDO em um arquivo só
- Use este se quiser criar tudo de uma vez
- Equivalente aos passos 1-5 juntos

# ============================================
# RESUMO RÁPIDO
# ============================================

### Para criar do ZERO:
1. Execute: `sushigo-complete-schema.sql` (tem tudo)
2. Execute: `04-add-pix-payment.sql` (se quiser PIX)

### Ou passo a passo:
1. 01-tables.sql
2. 02-indexes.sql
3. 03-rls-policies.sql
4. 04-seed-data.sql
5. 05-functions.sql
6. 04-add-pix-payment.sql

# ============================================
# CORRECOES DE ERROS COMUNS
# ============================================

Erro: "relation 'store_admins' does not exist"
→ Corrigido: Usar 'admin_users' em vez de 'store_admins'

Erro: "relation 'banners' does not exist"
→ Corrigido: Tabela 'banners' adicionada ao 01-tables.sql

Erro: "relation 'business_hours' does not exist"
→ Corrigido: Tabela 'business_hours' adicionada ao 01-tables.sql

Erro: "column 'user_id' does not exist"
→ **Causa:** Usou `sushigo-complete-schema.sql` mas executou `03-rls-policies.sql` (schema errado)
→ **Solução:** Execute `03-rls-policies-complete.sql` em vez disso!

# ============================================
