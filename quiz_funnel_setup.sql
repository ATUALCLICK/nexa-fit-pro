-- ============================================================
-- NEXA FIT PRO — TABELA DE SESSÕES E LEADS DO QUIZ (INLEAD MODEL)
-- Execute este script no SQL Editor do seu Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id text PRIMARY KEY,
  session_id text UNIQUE NOT NULL,
  email text,
  name text,
  gender text,
  age text,
  goal text,
  location text,
  body_type text,
  dream_body text,
  current_weight text,
  target_weight text,
  height text,
  imc text,
  highest_screen text,
  step_number integer DEFAULT 0,
  total_steps integer DEFAULT 32,
  status text DEFAULT 'in_progress', -- 'in_progress', 'qualified', 'lead_captured', 'checkout_reached', 'converted'
  answers jsonb DEFAULT '{}',
  steps_history jsonb DEFAULT '[]',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text, -- Nome do Criativo
  utm_term text,
  referrer text,
  user_agent text,
  device_type text,
  recovery_status text DEFAULT 'pending', -- 'pending', 'sent_d0', 'sent_d1', 'sent_d2', 'converted', 'unsubscribed'
  recovery_sent_at timestamp with time zone,
  last_email_subject text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS e permitir gravação pública para o tracking funcionar perfeitamente
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_sessions_all" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions_all" ON public.quiz_sessions FOR ALL USING (true);

-- Índices de alta performance para buscas e filtros
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_email ON public.quiz_sessions(email);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created ON public.quiz_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_utm_camp ON public.quiz_sessions(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_utm_cont ON public.quiz_sessions(utm_content);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON public.quiz_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_recovery ON public.quiz_sessions(recovery_status);

COMMENT ON TABLE public.quiz_sessions IS 'Rastreamento completo de sessões do quiz, etapas, respostas e UTMs do Nexa Fit Pro';
