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
Arquivo: `03-rls-policies.sql`
- Habilita Row Level Security
- Define políticas de acesso

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
Arquivo: `04-add-pix-payment.sql` (na pasta raiz)
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

# ============================================
