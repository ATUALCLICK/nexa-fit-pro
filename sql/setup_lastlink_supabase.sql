-- ========================================================
-- NEXA FIT PRO — INTEGRAÇÃO LASTLINK & SUPABASE (MIGRAÇÃO 100% SEGURA)
-- Pode ser executado múltiplas vezes no SQL Editor sem erro
-- ========================================================

-- 1. Garantir que a tabela 'profiles' existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Adiciona as colunas necessárias na tabela 'profiles' caso ainda não existam
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_logs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS idade INT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS genero TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS peso_atual NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS peso_meta NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS altura NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS objetivo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nivel TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS treinos_semana INT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS restricoes TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Tabela opcional dedicada de Assinaturas / Vendas Lastlink
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

-- 4. Tabela de Logs de Webhook (para você ver cada disparo em tempo real no Supabase)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  event TEXT,
  source TEXT DEFAULT 'lastlink',
  status TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Índices de busca por e-mail
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON public.subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_email ON public.webhook_logs(email);

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
