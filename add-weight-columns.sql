-- Adiciona colunas de peso para calculo por quilo
ALTER TABLE public.toppings ADD COLUMN IF NOT EXISTS weight_grams integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS base_weight_grams integer DEFAULT 300;

-- Adiciona configuracao de preco por kg nas app_settings
INSERT INTO public.app_settings (section, key, value, label, description)
VALUES ('pricing', 'price_per_kg', '0', 'Preco por Kg (R$)', 'Valor do quilo do acai para calculo automatico de precos')
ON CONFLICT DO NOTHING;
