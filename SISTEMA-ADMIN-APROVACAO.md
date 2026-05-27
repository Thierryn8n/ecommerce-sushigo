# 📋 SISTEMA DE LOGIN E APROVAÇÃO DE ADMINS

## ✅ O QUE FOI IMPLEMENTADO

### 1. Análise do Sistema Atual
**Status:** ✅ COMPLETO
- Login admin era fake/hardcoded (admin@acaidapraia.com / admin123)
- Não estava conectado ao Supabase
- Não tinha sistema de aprovação
- Não tinha limite de 2 admins

### 2. Atualização do Banco de Dados
**Arquivo:** `migration-admin-approval.sql`

**Alterações na tabela `profiles`:**
- `store_id` (uuid) - vincula admin à loja
- `is_admin` (boolean) - marca se é administrador
- `is_approved` (boolean) - marca se foi aprovado pelo dono
- `is_owner` (boolean) - marca se é dono da loja
- `role` (varchar) - 'customer' | 'admin' | 'owner'

**Funções criadas:**
- `count_admins(store_uuid)` - conta admins aprovados por loja
- `can_add_admin(store_uuid)` - verifica se pode adicionar admin (limite 2)

**Políticas RLS:**
- Admins podem ler profiles da própria loja
- Dono pode aprovar admins da loja

### 3. Sistema de Cadastro de Admin
**Arquivo:** `app/admin/cadastrar-admin/page.tsx`

**Funcionalidades:**
- Formulário de cadastro (nome, email, telefone, senha)
- Verifica limite de 2 admins por loja
- Cria usuário no Supabase Auth
- Marca como admin pendente de aprovação (`is_admin: true, is_approved: false`)
- Vincula à loja atual via `store_id`

### 4. Login Admin com Supabase
**Arquivo:** `app/login-adm/page.tsx`

**Funcionalidades:**
- Login real usando Supabase Auth
- Verifica se usuário é admin
- Verifica se admin foi aprovado
- Mensagens de erro específicas:
  - "Você não tem permissão de administrador"
  - "Seu acesso ainda não foi aprovado pelo dono da loja"
- Link para solicitar cadastro de admin

### 5. Sistema de Aprovação de Admins
**Arquivo:** `app/admin/aprovar-admins/page.tsx`

**Funcionalidades:**
- Lista todos os admins da loja
- Mostra status (aprovado/pendente)
- Botão para aprovar admin
- Botão para rejeitar solicitação
- Verifica limite de 2 admins antes de aprovar
- Estatísticas (total, aprovados, pendentes)
- Aviso quando atinge limite de 2 admins

### 6. Menu Admin Atualizado
**Arquivo:** `components/admin/admin-layout.tsx`

**Alteração:**
- Adicionado item "Admins" no menu lateral
- Link para `/admin/aprovar-admins`

### 7. Painel do Cliente
**Arquivo:** `app/perfil/page.tsx`

**Status:** ✅ JÁ EXISTE E FUNCIONAL

**Funcionalidades:**
- Login próprio via Supabase Auth
- Edição de dados pessoais (nome, telefone)
- Gerenciamento de endereços
- Visualização de pedidos (`/meus-pedidos`)
- Logout

## 🚀 COMO USAR

### Passo 1: Executar Migration
```bash
# Execute migration-admin-approval.sql no Supabase SQL Editor
```

### Passo 2: Criar Dono da Loja
```sql
-- Execute manualmente para cada loja
UPDATE public.profiles 
SET is_owner = true, is_admin = true, is_approved = true, store_id = 'UUID_DA_LOJA'
WHERE id = 'UUID_DO_DONO';
```

### Passo 3: Fluxo de Uso

**Para novos admins:**
1. Acessar `/login-adm`
2. Clicar em "Solicitar cadastro de administrador"
3. Preencher formulário em `/admin/cadastrar-admin`
4. Aguardar aprovação do dono

**Para dono da loja:**
1. Fazer login em `/login-adm`
2. Acessar `/admin/aprovar-admins`
3. Ver solicitações pendentes
4. Aprovar ou rejeitar admins
5. Limite máximo de 2 admins aprovados

**Para clientes:**
1. Fazer login em `/login`
2. Acessar `/perfil` para gerenciar dados
3. Acessar `/meus-pedidos` para ver histórico

## 📋 RESUMO

**Sistema Admin:** ✅ 100% implementado
- Login real com Supabase Auth
- Cadastro de admin com aprovação
- Limite de 2 admins por loja
- Sistema de aprovação pelo dono
- Vinculado com tabela profiles

**Sistema Cliente:** ✅ 100% funcional
- Login próprio via Supabase Auth
- Painel de perfil completo
- Gerenciamento de endereços
- Histórico de pedidos

**Separação:** ✅ Admins e clientes têm logins e painéis separados
