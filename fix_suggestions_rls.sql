-- Execute este SQL no Supabase SQL Editor para liberar INSERT na tabela suggestions

-- 1. Garante que RLS está habilitado
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- 2. Permite INSERT para qualquer pessoa (anon/publishable key)
CREATE POLICY "allow_anon_insert_suggestions"
  ON public.suggestions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3. Permite SELECT para qualquer pessoa (admin precisa ler)
CREATE POLICY "allow_anon_select_suggestions"
  ON public.suggestions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. Permite DELETE para qualquer pessoa (admin precisa deletar)
CREATE POLICY "allow_anon_delete_suggestions"
  ON public.suggestions
  FOR DELETE
  TO anon, authenticated
  USING (true);
