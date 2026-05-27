-- ============================================
-- AÇAÍ DA PRAIA - DATABASE SCHEMA COMPLETO
-- ============================================

-- Tipos enumerados
CREATE TYPE public.order_status AS ENUM ('pendente', 'confirmado', 'preparando', 'saiu_entrega', 'entregue', 'cancelado');
CREATE TYPE public.payment_method AS ENUM ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro');

-- ============================================
-- TABELA: acai_types
-- ============================================
CREATE TABLE public.acai_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  description text,
  price_addition numeric(10, 2) DEFAULT 0.00,
  weight_addition integer DEFAULT 0,
  image_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT acai_types_pkey PRIMARY KEY (id)
);

INSERT INTO public.acai_types (id, name, description, price_addition, weight_addition, image_url, is_active, display_order, created_at) VALUES 
('0583918b-701a-4d7c-a09c-6fe2c2007e4a', 'Com Morango', 'Açaí batido com morango fresco', 2.00, 50, NULL, true, 4, '2026-05-23 00:28:23.302232+00'),
('0975683c-220c-43fd-a514-be5555df405f', 'Proteico', 'Açaí com whey protein', 5.00, 30, NULL, true, 7, '2026-05-23 00:28:23.302232+00'),
('2ad5c607-2e1a-4a8a-a09a-c520d83875ea', 'Zero Açúcar', 'Açaí sem adição de açúcar, adoçado naturalmente', 2.00, 0, NULL, true, 2, '2026-05-23 00:28:23.302232+00'),
('925ae639-cd19-4d7b-9cb0-4c452aaf6bdd', 'Com Banana', 'Açaí batido com banana fresca', 0.00, 50, NULL, true, 3, '2026-05-23 00:28:23.302232+00'),
('cddf2fe4-c840-4832-9d06-83cb8308b852', 'Creme de Ninho', 'Açaí com creme de leite ninho', 3.00, 30, NULL, true, 5, '2026-05-23 00:28:23.302232+00'),
('eab90155-bd1e-4b1a-ba56-cd26464535ea', 'Mix Tropical', 'Açaí batido com manga e maracujá', 3.00, 60, NULL, true, 6, '2026-05-23 00:28:23.302232+00'),
('f5a0e73b-ee9c-4937-9597-869d3cc7cce9', 'Tradicional', 'Açaí puro e cremoso, o sabor original da Amazônia', 0.00, 0, NULL, true, 1, '2026-05-23 00:28:23.302232+00');

-- ============================================
-- TABELA: addresses
-- ============================================
CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label character varying(50),
  street character varying(200) NOT NULL,
  number character varying(20) NOT NULL,
  complement character varying(100),
  neighborhood character varying(100) NOT NULL,
  city character varying(100) NOT NULL DEFAULT 'Canoa Quebrada',
  state character varying(2) NOT NULL DEFAULT 'CE',
  zip_code character varying(10),
  reference text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_addresses_user ON public.addresses USING btree (user_id);

-- ============================================
-- TABELA: app_settings
-- ============================================
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section character varying(100) NOT NULL,
  key character varying(100) NOT NULL,
  value text,
  label character varying(200),
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT app_settings_pkey PRIMARY KEY (id),
  CONSTRAINT app_settings_section_key_key UNIQUE (section, key)
);

INSERT INTO public.app_settings (id, section, key, value, label, description, updated_at) VALUES 
('07c1a6e0-31c7-4729-a991-9d1388861802', 'benefits', 'benefit_1_title', 'Ingredientes Selecionados', 'Título benefício 1', NULL, '2026-05-23 00:28:23.302232+00'),
('0f0346d2-b191-4c8c-a6c3-e8d8474d0123', 'home', 'products_title', 'Sucessos da Praia', 'Título da seção de produtos', NULL, '2026-05-23 00:28:23.302232+00'),
('17e794c5-dd36-46ba-b3df-4730e8daf8e8', 'home', 'play_store_url', '#', 'Link do Google Play', NULL, '2026-05-23 00:28:23.302232+00'),
('2789708c-1151-4838-9e72-ac685ddcd308', 'home', 'categories_description', 'Monte do seu jeito com os melhores acompanhamentos e crie a combinação perfeita para você!', 'Descrição da seção de categorias', NULL, '2026-05-23 00:28:23.302232+00'),
('3060771f-6372-435b-8440-9ff3a668c6cc', 'benefits', 'benefit_1_subtitle', 'Sempre frescos', 'Subtítulo benefício 1', NULL, '2026-05-23 00:28:23.302232+00'),
('405b797b-172d-4c57-a9f8-837a067fa45d', 'benefits', 'benefit_4_subtitle', 'Ambiente protegido', 'Subtítulo benefício 4', NULL, '2026-05-23 00:28:23.302232+00'),
('441cdb74-f456-4710-a336-255cccd84d2d', 'benefits', 'benefit_3_subtitle', 'Chegou, pediu!', 'Subtítulo benefício 3', NULL, '2026-05-23 00:28:23.302232+00'),
('59bb26d9-02c0-4785-82e8-83c65094ec76', 'home', 'app_title', 'BAIXE NOSSO APP', 'Título da seção do app', NULL, '2026-05-23 00:28:23.302232+00'),
('6a024d51-28a2-47bf-ad66-7781e9ae2653', 'home', 'combos_description', 'Mais sabor por um preço incrível!', 'Descrição da seção de combos', NULL, '2026-05-23 00:28:23.302232+00'),
('832fa00e-5d8f-4092-a582-878dfb9a1b0e', 'benefits', 'benefit_2_subtitle', 'Puro e saudável', 'Subtítulo benefício 2', NULL, '2026-05-23 00:28:23.302232+00'),
('8e36fde3-ec86-4648-8391-94bb743f0f97', 'home', 'products_subtitle', 'OS MAIS PEDIDOS', 'Subtítulo da seção de produtos', NULL, '2026-05-23 00:28:23.302232+00'),
('a266e2e2-2327-492c-a099-7f8e8d9f5e8a', 'home', 'hero_title', 'O Melhor Açaí com o Sabor do Paraíso', 'Título do hero', NULL, '2026-05-23 00:28:23.302232+00'),
('b8c82935-b19b-4e47-a454-c9679b261de5', 'home', 'app_description', 'Baixe nosso app e receba ofertas exclusivas!', 'Descrição da seção do app', NULL, '2026-05-23 00:28:23.302232+00'),
('d9eedba7-e3a9-48ee-bc16-4ac2bec91382', 'home', 'hero_subtitle', 'CANOA QUEBRADA', 'Subtítulo do hero', NULL, '2026-05-23 00:28:23.302232+00'),
('f4d67251-5af4-4f13-8d7c-d85bcdbf0151', 'home', 'hero_description', 'Açaí cremoso, ingredientes selecionados e aquele toque especial que só a gente tem!', 'Descrição do hero', NULL, '2026-05-23 00:28:23.302232+00');

-- ============================================
-- TABELA: banners
-- ============================================
CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying(200),
  subtitle character varying(200),
  description text,
  image_url text,
  link_url character varying(500),
  button_text character varying(100),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT banners_pkey PRIMARY KEY (id)
);

INSERT INTO public.banners (id, title, subtitle, description, image_url, link_url, button_text, display_order, is_active, start_date, end_date, created_at) VALUES 
('05ba22d1-351b-455b-a782-637afc950a51', 'O melhor açaí, com o sabor do paraíso!', 'CANOA QUEBRADA', 'Açaí cremoso, ingredientes selecionados e aquele toque especial que só a gente tem!', NULL, '/cardapio', 'PEÇA AGORA', 1, true, NULL, NULL, '2026-05-23 00:28:23.302232+00'),
('24a9a772-c7b4-4719-b544-9d09a4ec2042', 'Combos Especiais', 'ECONOMIZE MAIS', 'Monte seu combo perfeito com preços imperdíveis!', NULL, '/combos', 'VER COMBOS', 2, true, NULL, NULL, '2026-05-23 00:28:23.302232+00'),
('8c899f6b-ffe0-4f9c-8510-494e0cf14ff1', 'Frete Grátis', 'PRIMEIRA COMPRA', 'Use o cupom BEMVINDO10 e ganhe 10% de desconto!', NULL, '/cardapio', 'APROVEITAR', 3, true, NULL, NULL, '2026-05-23 00:28:23.302232+00');

-- ============================================
-- TABELA: bowls
-- ============================================
CREATE TABLE public.bowls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  description text,
  ml integer NOT NULL,
  max_weight integer,
  price_addition numeric(10, 2) DEFAULT 0.00,
  image_url text,
  bowl_type character varying(50),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bowls_pkey PRIMARY KEY (id)
);

INSERT INTO public.bowls (id, name, description, ml, max_weight, price_addition, image_url, bowl_type, is_active, display_order, created_at) VALUES 
('3348711d-8317-4ff5-9ef9-959ed152e0a3', 'Copo Grande', 'Copo tradicional de 700ml', 700, 900, 0.00, NULL, 'copo', true, 3, '2026-05-23 00:28:23.302232+00'),
('4a2c545b-6524-4f07-874d-6be0dfd8a2b9', 'Tigela Média', 'Tigela de cerâmica 500ml', 500, 700, 2.00, NULL, 'tigela', true, 4, '2026-05-23 00:28:23.302232+00'),
('6cfee3c3-cf50-4c1d-b306-aa02826a64cf', 'Coco Natural', 'Servido no coco - 600ml', 600, 800, 8.00, NULL, 'especial', true, 7, '2026-05-23 00:28:23.302232+00'),
('88f43753-177e-4970-b53c-e30646143356', 'Tigela Grande', 'Tigela de cerâmica 750ml', 750, 1000, 3.00, NULL, 'tigela', true, 5, '2026-05-23 00:28:23.302232+00'),
('96b43629-c30e-452b-970d-164316f1764e', 'Copo Pequeno', 'Copo tradicional de 300ml', 300, 400, 0.00, NULL, 'copo', true, 1, '2026-05-23 00:28:23.302232+00'),
('9e1bb6e9-160e-4f3b-89d3-f70ea642e0fb', 'Barco Premium', 'Barco especial de madeira 1L', 1000, 1300, 5.00, NULL, 'barco', true, 6, '2026-05-23 00:28:23.302232+00'),
('aaddf0e7-cda3-4d9b-a297-0a2c7bfa80d0', 'Copo Médio', 'Copo tradicional de 500ml', 500, 650, 0.00, NULL, 'copo', true, 2, '2026-05-23 00:28:23.302232+00');

-- ============================================
-- TABELA: business_hours
-- ============================================
CREATE TABLE public.business_hours (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL,
  open_time time without time zone,
  close_time time without time zone,
  is_closed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT business_hours_pkey PRIMARY KEY (id)
);

INSERT INTO public.business_hours (id, day_of_week, open_time, close_time, is_closed, created_at) VALUES 
('293ce9bb-340c-4844-9f04-afa381e93bde', 3, '10:00:00', '22:00:00', false, '2026-05-22 23:39:05.010201+00'),
('3c9b75fe-abd0-4032-8160-75d55c59edb5', 4, '10:00:00', '22:00:00', false, '2026-05-22 23:39:05.010201+00'),
('4365c2ba-63d6-4529-8a60-8d831c3b7167', 2, '10:00:00', '22:00:00', false, '2026-05-22 23:39:05.010201+00'),
('76c782c5-027c-43ca-a822-544e07cd04a4', 5, '10:00:00', '23:00:00', false, '2026-05-22 23:39:05.010201+00'),
('c0cce777-2315-4dff-9f5b-dd30a38c65b3', 1, '10:00:00', '22:00:00', false, '2026-05-22 23:39:05.010201+00'),
('c1e9d9a1-9be3-48b9-937b-6484bb89cf18', 6, '10:00:00', '23:00:00', false, '2026-05-22 23:39:05.010201+00'),
('c8a5b713-38df-4400-90cc-43bb7c38f7d6', 0, '14:00:00', '22:00:00', false, '2026-05-22 23:39:05.010201+00');

-- ============================================
-- TABELA: categories
-- ============================================
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  slug character varying(100) NOT NULL,
  description text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  color character varying(20),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_slug_key UNIQUE (slug)
);

INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_active, created_at, updated_at, color) VALUES 
('255740ed-d9d7-47ed-91bb-63ffe9ea53b9', 'Açaí Kids', 'kids', 'Tamanhos especiais para crianças', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', 4, true, '2026-05-22 23:38:48.396285+00', '2026-05-22 23:38:48.396285+00', '#FFC300'),
('600c0216-f164-4001-b95d-45e101bad061', 'Açaí Fit', 'fit', 'Opções saudáveis sem açúcar adicionado', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', 3, true, '2026-05-22 23:38:48.396285+00', '2026-05-22 23:38:48.396285+00', '#00BFFF'),
('909e7635-7d3d-4c98-86c0-301fd9f97e49', 'Açaí Tradicional', 'tradicional', 'Nosso açaí clássico com ingredientes selecionados', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', 1, true, '2026-05-22 23:38:48.396285+00', '2026-05-22 23:38:48.396285+00', '#8A2BE2'),
('b29b737d-6692-415f-bdb3-d3127bd4bbfc', 'Açaí Premium', 'premium', 'Açaí especial com toppings exclusivos', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', 2, true, '2026-05-22 23:38:48.396285+00', '2026-05-22 23:38:48.396285+00', '#FF8C00'),
('f67f4bb5-5e13-409d-93f5-9521d08f5f79', 'Combos Especiais', 'combos', 'Combinações com preços imperdíveis', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', 5, true, '2026-05-22 23:38:48.396285+00', '2026-05-22 23:38:48.396285+00', '#FF00AA');

-- ============================================
-- TABELA: combo_items
-- ============================================
CREATE TABLE public.combo_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  combo_id uuid NOT NULL,
  product_id uuid,
  size_id uuid,
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT combo_items_pkey PRIMARY KEY (id),
  CONSTRAINT combo_items_combo_id_fkey FOREIGN KEY (combo_id) REFERENCES combos (id) ON DELETE CASCADE,
  CONSTRAINT combo_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
  CONSTRAINT combo_items_size_id_fkey FOREIGN KEY (size_id) REFERENCES sizes (id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: combos
-- ============================================
CREATE TABLE public.combos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(200) NOT NULL,
  slug character varying(200) NOT NULL,
  description text,
  original_price numeric(10, 2) NOT NULL,
  promo_price numeric(10, 2) NOT NULL,
  image_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT combos_pkey PRIMARY KEY (id),
  CONSTRAINT combos_slug_key UNIQUE (slug)
);

INSERT INTO public.combos (id, name, slug, description, original_price, promo_price, image_url, is_active, display_order, created_at, updated_at) VALUES 
('97abe9af-96dc-4529-a291-b15fbef38e60', 'Combo Família', 'combo-familia', '1 Açaí Família (1L) + 2 Açaís Kids', 59.70, 49.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', true, 2, '2026-05-22 23:39:15.821808+00', '2026-05-22 23:39:15.821808+00'),
('b797aa79-2aab-4a35-a484-4c73c5f33084', 'Combo Fit', 'combo-fit', '2 Açaís Fit (500ml) + 2 Águas de Coco', 51.80, 44.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', true, 4, '2026-05-22 23:39:15.821808+00', '2026-05-22 23:39:15.821808+00'),
('bba8b5b9-43f6-4ab9-ad24-59ed4659fc6c', 'Combo Casal', 'combo-casal', '2 Açaís Tradicionais (500ml) + 2 Águas', 45.80, 39.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', true, 1, '2026-05-22 23:39:15.821808+00', '2026-05-22 23:39:15.821808+00'),
('c3c98461-8145-4e85-8825-8b4717de2b8e', 'Combo Amigos', 'combo-amigos', '3 Açaís Premium (500ml)', 68.70, 59.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', true, 3, '2026-05-22 23:39:15.821808+00', '2026-05-22 23:39:15.821808+00');

-- ============================================
-- TABELA: coupons
-- ============================================
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying(50) NOT NULL,
  description text,
  discount_type character varying(20) NOT NULL,
  discount_value numeric(10, 2) NOT NULL,
  min_order_value numeric(10, 2) DEFAULT 0.00,
  max_uses integer,
  uses_count integer DEFAULT 0,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupons_pkey PRIMARY KEY (id),
  CONSTRAINT coupons_code_key UNIQUE (code)
);

INSERT INTO public.coupons (id, code, description, discount_type, discount_value, min_order_value, max_uses, uses_count, valid_from, valid_until, is_active, created_at) VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'BEMVINDO10', 'Desconto de boas-vindas para novos clientes', 'percentage', 10.00, 25.00, 100, 0, '2026-05-22 00:00:00+00', '2026-12-31 23:59:59+00', true, '2026-05-22 23:39:05.010201+00');

-- ============================================
-- TABELA: delivery_areas
-- ============================================
CREATE TABLE public.delivery_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  neighborhood character varying(100) NOT NULL,
  delivery_fee numeric(10, 2) NOT NULL,
  estimated_time_min integer,
  estimated_time_max integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT delivery_areas_pkey PRIMARY KEY (id)
);

INSERT INTO public.delivery_areas (id, neighborhood, delivery_fee, estimated_time_min, estimated_time_max, is_active, created_at) VALUES 
('11cbb1d0-3a35-4e51-94ae-d319167d8414', 'Cumbe', 10.00, 45, 70, true, '2026-05-22 23:39:05.010201+00'),
('14fdc947-beea-4957-a34a-0ffcf7edde98', 'Aracati Centro', 8.00, 40, 60, true, '2026-05-22 23:39:05.010201+00'),
('150e787e-a6e1-4fe0-85d7-c9b7aad4691f', 'Majorlândia', 5.00, 30, 45, true, '2026-05-22 23:39:05.010201+00'),
('c50c96bd-2d72-4640-9cdd-895b52e3fbaf', 'Canoa Quebrada', 0.00, 20, 35, true, '2026-05-22 23:39:05.010201+00'),
('d9f05827-e616-4ae6-ae70-b78236a7fd8f', 'Estevão', 5.00, 30, 45, true, '2026-05-22 23:39:05.010201+00');

-- ============================================
-- TABELA: notifications
-- ============================================
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title character varying(200) NOT NULL,
  message text,
  type character varying(50),
  is_read boolean DEFAULT false,
  link_url character varying(500),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: order_item_toppings
-- ============================================
CREATE TABLE public.order_item_toppings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL,
  topping_id uuid,
  topping_name character varying(100) NOT NULL,
  price numeric(10, 2) DEFAULT 0.00,
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_item_toppings_pkey PRIMARY KEY (id),
  CONSTRAINT order_item_toppings_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES order_items (id) ON DELETE CASCADE,
  CONSTRAINT order_item_toppings_topping_id_fkey FOREIGN KEY (topping_id) REFERENCES toppings (id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: order_items
-- ============================================
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid,
  product_name character varying(200) NOT NULL,
  size_id uuid,
  size_name character varying(50),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
  CONSTRAINT order_items_size_id_fkey FOREIGN KEY (size_id) REFERENCES sizes (id) ON DELETE SET NULL
);

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);

-- ============================================
-- TABELA: orders
-- ============================================
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number serial NOT NULL,
  user_id uuid,
  customer_name character varying(200),
  customer_phone character varying(20),
  customer_email character varying(200),
  address_id uuid,
  delivery_address text,
  subtotal numeric(10, 2) NOT NULL,
  delivery_fee numeric(10, 2) DEFAULT 0.00,
  discount numeric(10, 2) DEFAULT 0.00,
  total numeric(10, 2) NOT NULL,
  status public.order_status DEFAULT 'pendente',
  payment_method public.payment_method,
  payment_status character varying(50) DEFAULT 'pendente',
  notes text,
  estimated_delivery timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_address_id_fkey FOREIGN KEY (address_id) REFERENCES addresses (id) ON DELETE SET NULL,
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_created ON public.orders USING btree (created_at DESC);

-- ============================================
-- TABELA: products
-- ============================================
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(200) NOT NULL,
  slug character varying(200) NOT NULL,
  description text,
  base_price numeric(10, 2) NOT NULL,
  image_url text,
  category_id uuid,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  promotion_price numeric(10, 2),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_slug_key UNIQUE (slug),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE INDEX idx_products_featured ON public.products USING btree (is_featured) WHERE (is_featured = true);
CREATE INDEX idx_products_category ON public.products USING btree (category_id);

INSERT INTO public.products (id, name, slug, description, base_price, image_url, category_id, is_active, is_featured, display_order, created_at, updated_at, promotion_price) VALUES 
('2bdf6632-756e-4ddf-874b-37f7ea2b61ef', 'Açaí Tropical', 'acai-tropical', 'Açaí com manga, kiwi, coco ralado e mel', 20.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', 'b29b737d-6692-415f-bdb3-d3127bd4bbfc', true, false, 5, '2026-05-22 23:39:05.010201+00', '2026-05-22 23:39:05.010201+00', NULL),
('51805aa2-95f5-487e-ab0b-01c9a54a68f5', 'Açaí Fit', 'acai-fit', 'Açaí sem açúcar com banana, granola e pasta de amendoim', 18.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', '600c0216-f164-4001-b95d-45e101bad061', true, true, 3, '2026-05-22 23:39:05.010201+00', '2026-05-22 23:39:05.010201+00', NULL),
('5918f72a-cf33-4387-a161-195e76772409', 'Açaí Premium', 'acai-premium', 'Açaí especial com Nutella, leite ninho, granola, banana, morango e uva', 22.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', 'b29b737d-6692-415f-bdb3-d3127bd4bbfc', true, true, 2, '2026-05-22 23:39:05.010201+00', '2026-05-22 23:39:05.010201+00', NULL),
('7ff72273-2402-440b-bd89-e42bd55c5af9', 'Açaí Proteico', 'acai-proteico', 'Açaí com whey protein, banana, pasta de amendoim e granola', 24.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', '600c0216-f164-4001-b95d-45e101bad061', true, false, 6, '2026-05-22 23:39:05.010201+00', '2026-05-22 23:39:05.010201+00', NULL),
('a72e9be5-3ba7-47fc-828b-fe2511397b90', 'Açaí Kids', 'acai-kids', 'Açaí cremoso com leite condensado, granulado e confetes', 14.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', '255740ed-d9d7-47ed-91bb-63ffe9ea53b9', true, true, 7, '2026-05-22 23:39:05.010201+00', '2026-05-22 23:39:05.010201+00', NULL),
('b8c82935-b19b-4e47-a454-c9679b261de5', 'Açaí Tradicional', 'acai-tradicional', 'Açaí clássico com granola e banana', 16.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', '909e7635-7d3d-4c98-86c0-301fd9f97e49', true, true, 1, '2026-05-22 23:39:05.010201+00', '2026-05-22 23:39:05.010201+00', NULL),
('f4d67251-5af4-4f13-8d7c-d85bcdbf0151', 'Açaí Especial', 'acai-especial', 'Açaí com morango, kiwi e mel', 19.90, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png', '909e7635-7d3d-4c98-86c0-301fd9f97e49', true, false, 4, '2026-05-22 23:39:05.010201+00', '2026-05-22 23:39:05.010201+00', NULL);

-- ============================================
-- TABELA: profiles
-- ============================================
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name character varying(200),
  phone character varying(20),
  cpf character varying(14),
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: reviews
-- ============================================
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid,
  order_id uuid,
  rating integer NOT NULL,
  comment text,
  image_url text,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE SET NULL,
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT reviews_rating_check CHECK ((rating >= 1) AND (rating <= 5))
);

-- ============================================
-- TABELA: sizes
-- ============================================
CREATE TABLE public.sizes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(50) NOT NULL,
  ml integer NOT NULL,
  price_multiplier numeric(5, 2) DEFAULT 1.00,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sizes_pkey PRIMARY KEY (id)
);

INSERT INTO public.sizes (id, name, ml, price_multiplier, display_order, is_active, created_at) VALUES 
('02cf2a31-350c-4735-883b-b78cad4573d7', 'Pequeno', 300, 1.00, 1, true, '2026-05-22 23:38:48.396285+00'),
('97a61bd3-a937-4d39-b355-2114c7f7b450', 'Família', 1000, 2.50, 4, true, '2026-05-22 23:38:48.396285+00'),
('b071c4bf-7a10-4e60-979a-5dbfda176767', 'Médio', 500, 1.40, 2, true, '2026-05-22 23:38:48.396285+00'),
('f48a05b4-d8de-4543-8a55-cc8e69a55007', 'Grande', 700, 1.80, 3, true, '2026-05-22 23:38:48.396285+00');

-- ============================================
-- TABELA: store_settings
-- ============================================
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key character varying(100) NOT NULL,
  value text,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_settings_pkey PRIMARY KEY (id),
  CONSTRAINT store_settings_key_key UNIQUE (key)
);

INSERT INTO public.store_settings (id, key, value, description, updated_at) VALUES 
('060ec8cd-b3cf-455c-9ca7-e3e9160b9ca0', 'pix_key', 'contato@acaidapraia.com.br', 'Chave PIX', '2026-05-22 23:39:05.010201+00'),
('1bd44d16-5a4d-4e7a-9d10-ad1be3e2d14d', 'store_name', 'Açaí da Praia', 'Nome da loja', '2026-05-22 23:39:05.010201+00'),
('2ce06e93-64e9-4684-bb40-fcfa1bdd8839', 'min_order_value', '25.00', 'Valor mínimo do pedido', '2026-05-22 23:39:05.010201+00'),
('464498ee-51dd-4d10-bd78-ffbf6132e1d6', 'store_whatsapp', '5588999999999', 'WhatsApp para pedidos', '2026-05-22 23:39:05.010201+00'),
('472ec6c8-d76b-40a0-bffd-c6ba58b95b24', 'store_email', 'contato@acaidapraia.com.br', 'Email de contato', '2026-05-22 23:39:05.010201+00'),
('511c5078-7c15-4fad-a37c-7e459622da13', 'store_phone', '(88) 9 9999-9999', 'Telefone de contato', '2026-05-22 23:39:05.010201+00'),
('7709ecf1-5eb9-4e40-91d6-edeaf2aa468b', 'delivery_time_max', '50', 'Tempo máximo de entrega (minutos)', '2026-05-22 23:39:05.010201+00'),
('b8c82935-b19b-4e47-a454-c9679b261de5', 'instagram', '@acaidapraiaoficial', 'Instagram', '2026-05-22 23:39:05.010201+00'),
('bd9be74c-5b37-4c3b-9db4-125c9a1301f3', 'store_address', 'Av. Principal, 123 - Canoa Quebrada, CE', 'Endereço da loja', '2026-05-22 23:39:05.010201+00'),
('d9eedba7-e3a9-48ee-bc16-4ac2bec91382', 'facebook', 'acaidapraiaoficial', 'Facebook', '2026-05-22 23:39:05.010201+00'),
('f4d67251-5af4-4f13-8d7c-d85bcdbf0151', 'delivery_time_min', '30', 'Tempo mínimo de entrega (minutos)', '2026-05-22 23:39:05.010201+00');

-- ============================================
-- TABELA: toppings
-- ============================================
CREATE TABLE public.toppings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  price numeric(10, 2) DEFAULT 0.00,
  category character varying(50),
  image_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  max_quantity integer DEFAULT 5,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT toppings_pkey PRIMARY KEY (id)
);

INSERT INTO public.toppings (id, name, price, category, image_url, is_active, display_order, max_quantity, created_at) VALUES 
('0f37f794-7b9a-4571-82ee-db4e3e6e7630', 'Aveia', 0.00, 'granola', NULL, true, 12, 3, '2026-05-22 23:38:48.396285+00'),
('18641fd4-7b3c-481d-a293-d19bf4a7d9ec', 'Sucrilhos', 2.00, 'granola', NULL, true, 13, 3, '2026-05-22 23:38:48.396285+00'),
('19e05b06-bad3-484b-8fd2-b6e0b4e2c69d', 'Kiwi', 2.00, 'fruta', NULL, true, 4, 3, '2026-05-22 23:38:48.396285+00'),
('2ace6af0-e141-4c6a-892e-ec12a17898e6', 'Whey Protein', 6.00, 'extra', NULL, true, 38, 2, '2026-05-22 23:38:48.396285+00'),
('386bd169-1366-4b80-b325-f6f272f99b95', 'Granola', 0.00, 'granola', NULL, true, 10, 3, '2026-05-22 23:38:48.396285+00'),
('3992cfc5-4b8a-4e7a-91f4-b8734f814432', 'Oreo', 4.00, 'extra', NULL, true, 33, 3, '2026-05-22 23:38:48.396285+00'),
('4ebe34d4-f793-4c33-8f0b-7222b3d778cd', 'Amendoim', 2.00, 'extra', NULL, true, 35, 3, '2026-05-22 23:38:48.396285+00'),
('623efc77-b806-4e86-98ac-86a04b5759d2', 'Calda de Morango', 2.00, 'calda', NULL, true, 25, 2, '2026-05-22 23:38:48.396285+00'),
('6b586bb4-98f3-4a20-9901-aa69ebdac91f', 'Castanha de Caju', 4.00, 'extra', NULL, true, 34, 3, '2026-05-22 23:38:48.396285+00'),
('8aa96f96-b92a-4407-8511-3a06873a4817', 'Uva', 0.00, 'fruta', NULL, true, 3, 3, '2026-05-22 23:38:48.396285+00'),
('8dea6b9f-e59f-4730-acf5-1fd1113b39b1', 'Manga', 2.00, 'fruta', NULL, true, 5, 3, '2026-05-22 23:38:48.396285+00'),
('9ca5d9d4-0040-4869-8afe-d01764fe2d04', 'Calda de Chocolate', 2.00, 'calda', NULL, true, 24, 2, '2026-05-22 23:38:48.396285+00'),
('a4b31daf-44a5-44fb-9e96-d7399a91f503', 'Pasta de Amendoim', 4.00, 'extra', NULL, true, 37, 2, '2026-05-22 23:38:48.396285+00'),
('a857e185-9472-475e-ba10-6710f36b6132', 'Banana', 0.00, 'fruta', NULL, true, 1, 3, '2026-05-22 23:38:48.396285+00'),
('a92baf79-e0e2-4efa-9dd8-1e88f9f173a4', 'Coco Ralado', 2.00, 'extra', NULL, true, 36, 3, '2026-05-22 23:38:48.396285+00'),
('ae1afb6b-3e5c-4d84-ba3c-ebb5c98595ca', 'Leite Condensado', 2.00, 'creme', NULL, true, 20, 2, '2026-05-22 23:38:48.396285+00'),
('b8c82935-b19b-4e47-a454-c9679b261de5', 'Leite em Pó', 2.00, 'creme', NULL, true, 21, 2, '2026-05-22 23:38:48.396285+00'),
('c0cce777-2315-4dff-9f5b-dd30a38c65b3', 'Morango', 2.00, 'fruta', NULL, true, 2, 3, '2026-05-22 23:38:48.396285+00'),
('d9eedba7-e3a9-48ee-bc16-4ac2bec91382', 'Nutella', 4.00, 'chocolate', NULL, true, 22, 2, '2026-05-22 23:38:48.396285+00'),
('f4d67251-5af4-4f13-8d7c-d85bcdbf0151', 'Confetes', 2.00, 'doce', NULL, true, 23, 3, '2026-05-22 23:38:48.396285+00');

-- ============================================
-- TABELA: wishlist
-- ============================================
CREATE TABLE public.wishlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlist_pkey PRIMARY KEY (id),
  CONSTRAINT wishlist_user_id_product_id_key UNIQUE (user_id, product_id),
  CONSTRAINT wishlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Public access policies (for demo purposes - adjust for production)
CREATE POLICY "Public read access" ON public.addresses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.order_item_toppings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.wishlist FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FINALIZAÇÃO
-- ============================================
-- Schema completo criado com sucesso!
