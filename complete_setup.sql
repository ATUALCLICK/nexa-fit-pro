-- ============================================================
-- SCRIPT DE MIGRACAO / SETUP COMPLETO - BRONKS GYM APP
-- Rode este arquivo no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- 1. TABELAS BASE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  celular text NOT NULL UNIQUE,
  nome text,
  peso numeric,
  altura numeric,
  objetivo text,
  nivel text,
  genero text,
  dias_treino integer,
  restricoes jsonb DEFAULT '[]',
  foco_muscular text,
  atividades_extras jsonb DEFAULT '[]',
  horario_treino text DEFAULT '18:00',
  equipamentos jsonb DEFAULT '[]',
  ultimo_reset_plano text,
  hero_bg text,
  avatar_url text,
  estilo_dieta text DEFAULT 'Padrão',
  intolerancias jsonb DEFAULT '[]',
  daily_logs jsonb DEFAULT '{}',
  last_seen timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (true);


CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL,
  conteudo text NOT NULL,
  celular text REFERENCES public.profiles(celular),
  status text DEFAULT 'pendente',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- 2. TABELAS ADICIONAIS (DO SUPABASE_SETUP.SQL)
-- ============================================================

-- Storage bucket para imagens do admin (popups e exercícios)
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-assets', 'admin-assets', true) ON CONFLICT DO NOTHING;
DROP POLICY IF EXISTS "admin_assets_public_read" ON storage.objects;
CREATE POLICY "admin_assets_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'admin-assets');
DROP POLICY IF EXISTS "admin_assets_upload" ON storage.objects;
CREATE POLICY "admin_assets_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'admin-assets');
DROP POLICY IF EXISTS "admin_assets_delete" ON storage.objects;
CREATE POLICY "admin_assets_delete" ON storage.objects FOR DELETE USING (bucket_id = 'admin-assets');

-- Tabela de logs de hidratação
CREATE TABLE IF NOT EXISTS public.water_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  celular text NOT NULL REFERENCES public.profiles(celular) ON DELETE CASCADE,
  data date NOT NULL,
  garrafas integer DEFAULT 0,
  ml integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(celular, data)
);
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "water_logs_all" ON public.water_logs;
CREATE POLICY "water_logs_all" ON public.water_logs FOR ALL USING (true);

-- Tabela de logs de treino
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  celular text NOT NULL REFERENCES public.profiles(celular) ON DELETE CASCADE,
  data date NOT NULL,
  tipo text,
  series_feitas jsonb DEFAULT '{}',
  completado boolean DEFAULT false,
  exercicios_concluidos integer DEFAULT 0,
  total_exercicios integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(celular, data)
);
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workout_logs_all" ON public.workout_logs;
CREATE POLICY "workout_logs_all" ON public.workout_logs FOR ALL USING (true);

-- Tabela de logs de atividades complementares
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  celular text NOT NULL REFERENCES public.profiles(celular) ON DELETE CASCADE,
  data date NOT NULL,
  atividade text NOT NULL,
  completada boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(celular, data, atividade)
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activity_logs_all" ON public.activity_logs;
CREATE POLICY "activity_logs_all" ON public.activity_logs FOR ALL USING (true);

-- Tabela de popups/banners promocionais (admin)
CREATE TABLE IF NOT EXISTS public.admin_popups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  descricao text,
  imagem_url text,
  botao_texto text DEFAULT 'Saiba mais',
  botao_link text,
  ativo boolean DEFAULT true,
  ordem integer DEFAULT 0,
  cliques integer DEFAULT 0,
  cancelamentos integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.admin_popups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_popups_all" ON public.admin_popups;
CREATE POLICY "admin_popups_all" ON public.admin_popups FOR ALL USING (true);

-- Função para incrementar métricas do popup atômicamente
CREATE OR REPLACE FUNCTION public.increment_popup_metric(popup_id uuid, metric text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF metric = 'cliques' THEN
    UPDATE public.admin_popups SET cliques = COALESCE(cliques, 0) + 1 WHERE id = popup_id;
  ELSIF metric = 'cancelamentos' THEN
    UPDATE public.admin_popups SET cancelamentos = COALESCE(cancelamentos, 0) + 1 WHERE id = popup_id;
  END IF;
END;
$$;

-- Tabela de customizações de exercícios (admin)
CREATE TABLE IF NOT EXISTS public.admin_exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id integer NOT NULL UNIQUE,
  nome text,
  video_id text,
  imagem_url text,
  descricao text,
  series integer,
  reps text,
  descanso integer,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.admin_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_exercises_all" ON public.admin_exercises;
CREATE POLICY "admin_exercises_all" ON public.admin_exercises FOR ALL USING (true);

-- Config de admin (senha de acesso)
CREATE TABLE IF NOT EXISTS public.admin_config (
  key text PRIMARY KEY,
  value text
);
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_config_all" ON public.admin_config;
CREATE POLICY "admin_config_all" ON public.admin_config FOR ALL USING (true);

-- Insere senha padrão do admin (mude depois!)
INSERT INTO public.admin_config (key, value) VALUES ('admin_password', 'bronks2026') ON CONFLICT (key) DO NOTHING;

-- Tabela de Registro de Pesos nos Exercícios (Evolução)
CREATE TABLE IF NOT EXISTS public.exercise_weights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  celular text NOT NULL REFERENCES public.profiles(celular) ON DELETE CASCADE,
  exercicio_id integer NOT NULL,
  peso numeric NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(celular, exercicio_id)
);
ALTER TABLE public.exercise_weights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exercise_weights_all" ON public.exercise_weights;
CREATE POLICY "exercise_weights_all" ON public.exercise_weights FOR ALL USING (true);


-- ============================================================
-- 3. TABELA DE PRODUTOS AFILIADOS (ACHADINHOS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_affiliate_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagens TEXT[] DEFAULT '{}',
  link_afiliado TEXT NOT NULL,
  botao_texto TEXT DEFAULT 'Ver Oferta',
  preco_original TEXT,
  preco_promocional TEXT,
  loja TEXT DEFAULT 'outro',
  ativo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  cliques INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permitir leitura pública (anon) para que os usuários vejam os produtos
ALTER TABLE public.admin_affiliate_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Produtos afiliados são públicos para leitura" ON public.admin_affiliate_products;
CREATE POLICY "Produtos afiliados são públicos para leitura"
  ON public.admin_affiliate_products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Inserção de produtos via service role" ON public.admin_affiliate_products;
CREATE POLICY "Inserção de produtos via service role"
  ON public.admin_affiliate_products FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Atualização de produtos via service role" ON public.admin_affiliate_products;
CREATE POLICY "Atualização de produtos via service role"
  ON public.admin_affiliate_products FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Exclusão de produtos via service role" ON public.admin_affiliate_products;
CREATE POLICY "Exclusão de produtos via service role"
  ON public.admin_affiliate_products FOR DELETE
  USING (true);

-- Função para incrementar cliques de produtos
CREATE OR REPLACE FUNCTION public.increment_product_clicks(product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.admin_affiliate_products
  SET cliques = cliques + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 4. REGRAS DE SEGURANÇA PARA "SUGGESTIONS"
-- ============================================================

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_anon_insert_suggestions" ON public.suggestions;
CREATE POLICY "allow_anon_insert_suggestions"
  ON public.suggestions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_anon_select_suggestions" ON public.suggestions;
CREATE POLICY "allow_anon_select_suggestions"
  ON public.suggestions
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_anon_delete_suggestions" ON public.suggestions;
CREATE POLICY "allow_anon_delete_suggestions"
  ON public.suggestions
  FOR DELETE
  TO anon, authenticated
  USING (true);
