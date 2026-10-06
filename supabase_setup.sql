-- ============================================================
-- SCRIPT DE MIGRAÇÃO INCREMENTAL — Execute apenas o que falta
-- Pode rodar com segurança mesmo com tabelas/colunas já existentes
-- ============================================================

-- 1. Colunas novas na tabela profiles (seguro re-rodar)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS atividades_extras jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_logs jsonb DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS foco_muscular text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hero_bg text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS horario_treino text DEFAULT '18:00';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipamentos jsonb DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ultimo_reset_plano text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS estilo_dieta text DEFAULT 'Padrão';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intolerancias jsonb DEFAULT '[]';

-- Storage bucket para imagens do admin (popups e exercícios)
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-assets', 'admin-assets', true) ON CONFLICT DO NOTHING;
DROP POLICY IF EXISTS "admin_assets_public_read" ON storage.objects;
CREATE POLICY "admin_assets_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'admin-assets');
DROP POLICY IF EXISTS "admin_assets_upload" ON storage.objects;
CREATE POLICY "admin_assets_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'admin-assets');
DROP POLICY IF EXISTS "admin_assets_delete" ON storage.objects;
CREATE POLICY "admin_assets_delete" ON storage.objects FOR DELETE USING (bucket_id = 'admin-assets');

-- 2. Tabela de logs de hidratação
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

-- 3. Tabela de logs de treino
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

-- 4. Tabela de logs de atividades complementares
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

-- 5. Tabela de popups/banners promocionais (admin)
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

-- 6. Tabela de customizações de exercícios (admin)
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

-- 7. Config de admin (senha de acesso)
CREATE TABLE IF NOT EXISTS public.admin_config (
  key text PRIMARY KEY,
  value text
);
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_config_all" ON public.admin_config;
CREATE POLICY "admin_config_all" ON public.admin_config FOR ALL USING (true);

-- Insere senha padrão do admin (mude depois!)
INSERT INTO public.admin_config (key, value) VALUES ('admin_password', 'bronks2026') ON CONFLICT (key) DO NOTHING;

-- 8. Tabela de Registro de Pesos nos Exercícios (Evolução)
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
