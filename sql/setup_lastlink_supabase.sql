-- ========================================================
-- NEXA FIT PRO — INTEGRAÇÃO LASTLINK & SUPABASE
-- Script para garantir tabelas de perfis, assinaturas e webhooks
-- ========================================================

-- 1. Garantir que a tabela 'profiles' tem suporte à coluna de e-mail e daily_logs (assinatura)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT,
  idade INT,
  genero TEXT,
  peso_atual NUMERIC,
  peso_meta NUMERIC,
  altura NUMERIC,
  objetivo TEXT,
  nivel TEXT,
  treinos_semana INT,
  restricoes TEXT[],
  daily_logs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela opcional dedicada de Assinaturas / Vendas Lastlink
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  buyer_name TEXT,
  product_id TEXT,
  plan_id TEXT,
  plan_name TEXT,
  duration_days INT,
  status TEXT DEFAULT 'paid', -- 'paid', 'refunded', 'cancelled'
  transaction_id TEXT,
  source TEXT DEFAULT 'lastlink',
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Logs de Webhook (para você ver cada disparo em tempo real no Supabase Table Editor)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  event TEXT,
  source TEXT DEFAULT 'lastlink',
  status TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Índices para busca ultra rápida no login por e-mail
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON public.subscriptions(email);

-- 4. Habilitar RLS (Row Level Security) com políticas de leitura e escrita públicas/anon
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para leitura de profiles pelo app do aluno
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Permitir leitura pública de perfis'
  ) THEN
    CREATE POLICY "Permitir leitura pública de perfis" ON public.profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Permitir inserção e atualização de perfis'
  ) THEN
    CREATE POLICY "Permitir inserção e atualização de perfis" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Permitir acesso de assinaturas'
  ) THEN
    CREATE POLICY "Permitir acesso de assinaturas" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
