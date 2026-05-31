# Prompt: Redesign Completo — Loja de Sushi (SushiGo)

## Contexto Atual

Este é um e-commerce Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 que foi migrado de uma loja de açaí para uma loja de sushi. A migração de branding e cores já foi feita, mas a estrutura visual e organizacional ainda precisa ser redesenhada para refletir uma experiência de sushi de verdade.

## Stack Tecnológica

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase (auth, database, storage)
- shadcn/ui (componentes)
- Framer Motion (animações)
- Stripe (pagamentos)
- Zustand + SWR (estado)

## Cores da Marca (já implementadas)

- **Vermelho principal:** `#D62828`
- **Dourado:** `#FCBF49`
- **Background escuro:** `#0A0A0A` (dark)
- **Background claro:** `#FFFFFF` (light)
- **Card escuro:** `#141414`
- **Card claro:** `#F5F5F5`

## O que deve ser REDESENHADO

### 1. Landing Page (`/`)
- Hero com imagem de sushi de alta qualidade
- Categorias destacadas: Sashimi, Nigiri, Temaki, Hot Rolls, Combo
- Seção "Mais Pedidos" com cards de produtos
- Seção "Combos Especiais"
- Seção "Depoimentos"
- Seção "Sobre Nós" (já existe em `/sobre-nos`)
- Footer com contato, redes sociais, horário de funcionamento
- **Deve parecer uma loja de sushi premium, não genérica**

### 2. Cardápio (`/cardapio`)
- Filtros por categoria: Sashimi, Nigiri, Temaki, Hot Rolls, Uramaki, Combos, Bebidas
- Visual em grid com cards que mostrem:
  - Imagem do sushi
  - Nome
  - Descrição curta
  - Preço
  - Tag de "Mais Pedido" ou "Novo" se aplicável
  - Botão "Adicionar"
- Filtro lateral para molhos inclusos, tipo de peixe, etc.

### 3. Página do Produto (`/produto/[id]`)
- Galeria de imagens do sushi
- Nome, descrição detalhada
- **Seleção de quantidade em PEÇAS** (4, 8, 12, 16, 20, 30, 50)
- **Seleção de molhos** (shoyu, tarê, maionese temperada, molho picante, etc.) — quantidade limitada
- **Seleção de condimentos** (gergelim, cebolinha, crispy de alho)
- Botão "Adicionar ao Carrinho"
- Seção "Você também pode gostar"

### 4. Carrinho (sidebar)
- Lista de itens com imagem miniatura
- Cada item mostra: nome, variação (peças), molhos selecionados, quantidade
- Botão para ajustar quantidade
- Botão remover
- Subtotal, taxa de entrega, total
- Botão "Finalizar Pedido" → `/checkout`

### 5. Checkout (`/checkout`)
- Passo 1: Endereço de entrega (com busca por CEP)
- Passo 2: Resumo do pedido
- Passo 3: Pagamento (Stripe/PIX)
- Passo 4: Confirmação com número do pedido
- Opção de retirada no local

### 6. Painel Admin (`/admin/*`)
Redesenhar TODAS as páginas do admin para o contexto sushi:

#### Dashboard (`/admin`)
- Cards de métricas: Pedidos Hoje, Receita, Ticket Médio, Novos Clientes
- Gráfico de pedidos por hora (pico: 19h-22h)
- Lista de pedidos recentes
- Status em tempo real

#### Produtos (`/admin/produtos`)
- Lista com busca e filtros
- Colunas: Nome, Categoria, Preço, Quantidade Peças Base, Status, Ações
- Modal de criação/edição com:
  - Nome, descrição, imagem
  - Categoria
  - Preço base
  **Quantidade de peças base** (não peso em gramas!)
  - Molhos inclusos (seleção múltipla)
  - Variações de tamanho com quantidade de peças
  - Status ativo/inativo

#### Categorias (`/admin/categorias`)
- Categorias sushi: Sashimi, Nigiri, Temaki, Hot Rolls, Uramaki, Combos, Bebidas, Sobremesas
- Cada categoria com ícone, cor, ordem de exibição

#### Combos (`/admin/combos`)
- Criação de combos com seleção de itens
- Preço do combo (pode ter desconto vs individual)
- Itens substituíveis (ex: trocar Hot Roll por Uramaki)

#### Molhos (`/admin/molhos`)
- Gerenciar molhos disponíveis: Shoyu, Tarê, Maionese Temperada, Molho Picante, Geleia de Gengibre
- Preço extra se aplicável
- Quantidade máxima por pedido

#### Tipos de Sushi (`/admin/tipos-sushi`)
- Cadastro de tipos: Sashimi, Nigiri, Temaki, Hot Roll, Uramaki
- Descrição, imagem ilustrativa

#### Pedidos (`/admin/pedidos`)
- Lista com filtros: Hoje, Ontem, Semana, Mês
- Status: Pendente, Em Preparo, Pronto, Em Entrega, Entregue, Cancelado
- Detalhes do pedido: itens com peças, molhos, endereço
- Impressão de comanda

#### Kanban (`/admin/pedidos/kanban`)
- Colunas: Pendente → Em Preparo → Pronto → Em Entrega → Entregue
- Drag & drop para mover pedidos
- Cards com: #pedido, cliente, hora, valor, itens principais

#### Cupons (`/admin/cupons`)
- Criar cupons de desconto
- Valor mínimo, uso único, data de expiração

#### Entrega (`/admin/entrega`)
- Configurar bairros e taxas de entrega
- Tempo estimado por bairro
- Raio de entrega no mapa

#### Configurações (`/admin/configuracoes`)
- Dados da loja: nome, telefone, WhatsApp, endereço
- Horário de funcionamento
- Tempo mínimo de preparo
- Taxa de entrega padrão

#### App Desktop (`/admin/aplicativo`)
- Download do SushiGo Printer
- Status da impressora
- Configurações de impressão

### 7. Acompanhamento de Pedido (`/pedido/[id]/acompanhamento`)
- Timeline do pedido: Recebido → Em Preparo → Pronto → Saiu para Entrega → Entregue
- Mapa com localização do entregador (se aplicável)
- Chat com a loja

### 8. Perfil do Cliente (`/perfil/*`)
- Dados pessoais
- Endereços salvos
- Histórico de pedidos com repetição de pedido
- Carrinho abandonado

## O que DEVE ser mantido do código existente

- Supabase config (`lib/supabase.ts`)
- Autenticação (middleware, login, callback)
- Stripe integration (`lib/stripe.ts`)
- WhatsApp integration (`lib/whatsapp.ts`) — mas adaptar mensagens para sushi
- Types principais (`lib/types.ts`)
- Theme provider (`app/providers.tsx`)
- Tailwind config e globals.css (já tem as cores sushi)

## Estrutura de Dados (manter, já está correta)

```typescript
// Produto
interface Product {
  id: string
  name: string
  description: string
  price: number
  base_pieces: number // quantidade de peças base
  category_id: string
  image_url: string
  molhos_included: string[] // molhos que já vêm inclusos
  is_combo: boolean
  is_active: boolean
}

// Variação do produto
interface ProductVariant {
  id: string
  product_id: string
  variant_name: string // "8 peças", "16 peças", "30 peças"
  quantity_value: number // 8, 16, 30
  additional_price: number
}

// Item do pedido
interface OrderItem {
  id: string
  order_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  variant_id?: string
  quantity_pieces: number
  selected_molhos: string[]
  toppings?: string[] // condimentos
  sauces?: string[] // molhos extras
  notes?: string
}
```

## Design System

- **Tipografia:** Fonte moderna, limpa (Inter ou Geist)
- **Cards:** Bordas arredondadas (rounded-2xl), sombras sutis
- **Botões:** Primary vermelho (`#D62828`), hover com dourado (`#FCBF49`)
- **Ícones:** Lucide React
- **Animações:** Framer Motion para transições suaves
- **Temas:** Dark/Light toggle já implementado
- **Responsivo:** Mobile-first, até 320px

## Arquivos a Criar/Atualizar

### Novos arquivos para criar:
- `PROMPT.md` (este arquivo)
- Landing page redesenhada
- Cards de produto com visual sushi
- Páginas admin redesenhadas
- Componentes reutilizáveis de sushi

### Arquivos a deletar (feito):
- Todos os SQLs de fix temporários
- Documentação antiga do açaí
- `create tables.txt`

### Arquivos SQL a MANTER (schema de referência):
- `database-schema.sql` — schema completo do banco
- `kanban-pedidos-schema.sql` — schema do kanban
- `migracao-sushi-estrutura-completa.sql` — histórico da migração
- `create-storage-buckets.sql` — buckets do Supabase
- `create-table-stores.sql` — multi-tenancy
- `multi-tenancy-schema.sql` — multi-tenancy
- `migration-admin-approval.sql` — sistema de aprovação de admins

## Instruções para a IA

1. **MANTER** toda a lógica de negócio, auth, pagamento, e integrações existentes
2. **REDESENHAR** apenas a interface, layout, componentes visuais e organização
3. **USAR** as cores e tipografia definidas acima
4. **NÃO** mudar os types do TypeScript (já estão corretos para sushi)
5. **NÃO** mudar as chamadas ao Supabase (já funcionam)
6. **ADAPTAR** textos e labels para linguagem de sushi
7. **CRIAR** componentes reutilizáveis para cards de produto, itens do carrinho, etc.
8. **GARANTIR** que o design seja mobile-first e responsivo
9. **USAR** Framer Motion para animações sutis
10. **TESTAR** o build (`npm run build`) antes de finalizar

## Critérios de Aceite

- [ ] Landing page parece uma loja de sushi premium
- [ ] Cards de produto mostram peças (não gramas)
- [ ] Seleção de molhos funciona com limite
- [ ] Carrinho mostra peças e molhos corretamente
- [ ] Checkout aceita endereço e pagamento
- [ ] Painel admin tem todas as seções sushi
- [ ] Kanban funciona com drag & drop
- [ ] Tema dark/light funciona em todas as páginas
- [ ] Build passa sem erros (`npm run build`)
- [ ] Nenhuma referência a açaí, peso, gramas, vasilha, tigela
