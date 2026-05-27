# PROMPT COMPLETO — ECOMMERCE “AÇAÍ DA PRAIA”

Use este prompt para uma IA criar TODO o sistema completo, moderno, profissional e escalável do ecommerce “Açaí da Praia”.

---

Crie um ecommerce COMPLETO, PROFISSIONAL, MODERNO e EXTREMAMENTE CHAMATIVO para uma loja de açaí chamada:

# AÇAÍ DA PRAIA

O sistema deve ser FULLSTACK e extremamente profissional, com visual premium, moderno, tropical, vibrante e altamente convertido para vendas online.

A identidade visual deve misturar:

* Praia tropical
* Pôr do sol
* Canoa Quebrada
* Tons neon
* Roxo do açaí
* Laranja sunset
* Azul oceano
* Preto premium
* Glow effects
* Estilo moderno estilo iFood + Apple + beach club premium

A UI deve dar MUITA vontade de comprar açaí.

---

# STACK OBRIGATÓRIA

Use:

* Next.js 15
* React
* TypeScript
* TailwindCSS
* Shadcn UI
* Framer Motion
* Supabase
* PostgreSQL
* Supabase Storage
* React Query / Tanstack Query
* Zustand
* Stripe Checkout
* WhatsApp Integration
* Upload de imagens via Supabase Storage
* Responsivo mobile-first
* PWA
* SEO otimizado

---

# PALETA DE CORES

Primary Purple: #5B1E87
Purple Neon: #8A2BE2
Sunset Orange: #FF8C00
Beach Yellow: #FFC300
Ocean Blue: #00BFFF
Dark Background: #120018
Pink Glow: #FF00AA
White Soft: #F5F5F5

---

# ESTILO VISUAL

Criar design extremamente premium:

* Hero section cinematográfica
* Fundo tropical sunset
* Elementos neon
* Glow roxo
* Cards modernos
* Botões animados
* Efeito vidro (glassmorphism)
* Efeito hover premium
* Ícones modernos
* Tipografia impactante
* Interface estilo aplicativo premium

---

# PÁGINAS OBRIGATÓRIAS

# CLIENTE

## Home

* Banner principal animado
* CTA “Peça Agora”
* Produtos em destaque
* Combos
* Mais pedidos
* Categorias
* Benefícios
* Avaliações
* Instagram feed fake
* Footer completo

---

## Cardápio

* Listagem de produtos
* Categorias
* Busca
* Filtro
* Ordenação
* Promoções

---

## Página do Produto

Quando clicar no produto:

## ETAPA 1 — Escolher vasilha/copo

Cada vasilha possui:

* Nome
* Imagem
* Quantidade ML
* Valor adicional opcional
* Peso suportado
* Tipo:

  * Copo
  * Barco
  * Tigela
  * Especial

A imagem da vasilha deve vir do Supabase Storage.

---

## ETAPA 2 — Escolher tipo de açaí

Exemplo:

* Tradicional
* Zero açúcar
* Banana
* Morango
* Creme de ninho
* Mix tropical

Cada tipo:

* Pode alterar preço
* Pode alterar peso
* Pode ter imagem

---

## ETAPA 3 — Condimentos

O usuário poderá selecionar:

* Frutas
* Chocolates
* Cremes
* Crocantes
* Doces
* Extras

Cada condimento terá:

* Nome
* Imagem
* Peso adicional
* Valor adicional
* Limite máximo
* Categoria

O peso deve aumentar dinamicamente no produto.

O preço também deve recalcular em tempo real.

Mostrar:

* Peso total
* Valor total
* Quantidade de adicionais

Tudo atualizado em tempo real.

---

## ETAPA 4 — Coberturas

Sistema igual ao dos condimentos.

---

## ETAPA 5 — Observações

Campo:

* “Remover algo”
* “Mais gelo”
* “Pouco doce”
* etc

---

## ETAPA 6 — Adicionar ao Carrinho

Botão:

* Adicionar ao carrinho

---

# CARRINHO

Carrinho lateral moderno estilo iFood.

Mostrar:

* Produtos
* Adicionais
* Quantidade
* Peso total
* Frete
* Cupom
* Total

Botões:

* Finalizar pelo WhatsApp
* Ir para Checkout

---

# CHECKOUT

* Endereço
* CEP
* Método de entrega
* Pagamento
* Pix
* Cartão
* Stripe
* Dinheiro
* Troco

---

# WHATSAPP

Ao finalizar pelo WhatsApp:

Gerar mensagem formatada automaticamente:

* Produtos
* Condimentos
* Quantidade
* Peso
* Valor
* Endereço
* Nome cliente

Abrir WhatsApp automaticamente.

---

# LOGIN CLIENTE

Login separado do admin.

Usuário cliente poderá:

* Favoritar produtos
* Salvar carrinho
* Ver pedidos
* Histórico
* Repetir pedido
* Editar perfil
* Endereços salvos

Autenticação:

* Email/senha
* Google Login

---

# ÁREA ADMIN

Criar painel COMPLETO.

URL:

* /login-adm
* /admin

Painel moderno premium.

---

# DASHBOARD ADMIN

Mostrar:

* Vendas do dia
* Pedidos
* Produtos mais vendidos
* Ticket médio
* Lucro
* Clientes
* Pedidos pendentes
* Gráficos

---

# GERENCIAMENTO DE PRODUTOS

Admin pode:

* Criar produto
* Editar
* Excluir
* Duplicar
* Pausar

Campos:

* Nome
* Descrição
* Imagem
* Banner
* Peso base
* Valor base
* Categoria
* Disponível
* Promoção
* Ordem

Upload de imagens:

* Supabase Storage

---

# GERENCIAMENTO DE VASILHAS

CRUD completo.

Campos:

* Nome
* Imagem
* ML
* Peso máximo
* Valor adicional
* Tipo

---

# GERENCIAMENTO DE CONDIMENTOS

CRUD completo.

Campos:

* Nome
* Imagem
* Categoria
* Peso
* Valor
* Limite máximo
* Disponível

Upload no bucket:

* condimentos

---

# GERENCIAMENTO DE COBERTURAS

CRUD completo.

---

# GERENCIAMENTO DE PEDIDOS

Status:

* Pendente
* Preparando
* Saiu para entrega
* Entregue
* Cancelado

Admin pode:

* Atualizar status
* Ver detalhes
* Imprimir pedido
* WhatsApp do cliente
* Gerar relatório

---

# CONFIGURAÇÕES DA LOJA

Admin pode alterar:

* Logo
* Banner
* Nome da loja
* Cor principal
* WhatsApp
* Taxa de entrega
* Horário funcionamento
* Redes sociais
* Texto homepage
* SEO

---

# SISTEMA DE ENTREGA

* Taxa por bairro
* Frete fixo
* Retirada no local

---

# SISTEMA DE CUPONS

* Desconto %
* Desconto fixo
* Frete grátis
* Valor mínimo

---

# NOTIFICAÇÕES

* Pedido novo
* Atualização status
* Pedido pronto

---

# SISTEMA DE AVALIAÇÕES

Clientes podem:

* Dar nota
* Escrever comentário
* Enviar foto

---

# FAVORITOS

Wishlist completa.

---

# PÁGINA DE PROMOÇÕES

Combos:

* Açaí + energético
* Açaí família
* Combo casal

---

# BLOG

Página SEO:

* Benefícios do açaí
* Receitas
* Notícias

---

# ESTRUTURA DO BANCO (SUPABASE)

Crie TODOS os SQL necessários.

Tabelas:

* users
* profiles
* addresses
* products
* product_images
* product_categories
* bowls
* bowl_images
* acai_types
* toppings
* toppings_categories
* sauces
* carts
* cart_items
* wishlist
* orders
* order_items
* coupons
* reviews
* settings
* banners
* delivery_zones
* notifications

---

# CRIAR SQL INICIAL DOS PRODUTOS

Criar inserts completos com:

## Produtos:

* Açaí 200g
* Açaí 500g
* Açaí 750g
* Açaí 1kg

Com:

* preços
* imagens mock
* categorias

---

# STORAGE BUCKETS

Criar buckets:

* products
* bowls
* toppings
* sauces
* banners
* logos
* reviews

---

# REGRAS IMPORTANTES

* Sistema extremamente rápido
* Código limpo
* Arquitetura escalável
* Componentização avançada
* Dark mode
* Responsivo
* Mobile premium
* SEO otimizado
* Lazy loading
* Skeleton loading
* Segurança completa
* Middleware auth
* Row Level Security Supabase

---

# EXPERIÊNCIA

Quero animações premium:

* Hover glow
* Smooth transitions
* Loading bonito
* Carrinho animado
* Microinterações
* Scroll animations
* Partículas tropicais
* Background animado

---

# DIFERENCIAL

Adicionar:

* Sistema “Monte seu Açaí”
* Programa fidelidade
* Cashback
* Gamificação
* Ranking clientes
* Indicação amigos
* Sistema pontos

---

# IA

Adicionar:

* Sugestão automática de combos
* Produtos recomendados
* “Seu açaí ideal”

---

# FINAL

Entregue:

* Estrutura completa do projeto
* Arquitetura de pastas
* Todas páginas
* Componentes
* Banco SQL completo
* APIs
* Hooks
* Contexts
* Stores Zustand
* Integração Supabase
* Integração Stripe
* Integração WhatsApp
* Seed inicial
* README completo
* Deploy Vercel
* Variáveis ambiente
* Setup completo

O resultado deve parecer um ecommerce profissional milionário de delivery premium de açaí.
