-- ══════════════════════════════════════════════════════════════
-- Bronks Gym App — Tabela de Produtos Afiliados (Achadinhos)
-- Execute este SQL no painel SQL do Supabase
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_affiliate_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagens TEXT[] DEFAULT '{}',
  link_afiliado TEXT NOT NULL,
  botao_texto TEXT DEFAULT 'Ver Oferta',
  preco_original TEXT,
  preco_promocional TEXT,
  loja TEXT DEFAULT 'outro',  -- 'mercadolivre', 'amazon', 'shopee', 'outro'
  ativo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  cliques INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permitir leitura pública (anon) para que os usuários vejam os produtos
ALTER TABLE admin_affiliate_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos afiliados são públicos para leitura"
  ON admin_affiliate_products FOR SELECT
  USING (true);

CREATE POLICY "Inserção de produtos via service role"
  ON admin_affiliate_products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Atualização de produtos via service role"
  ON admin_affiliate_products FOR UPDATE
  USING (true);

CREATE POLICY "Exclusão de produtos via service role"
  ON admin_affiliate_products FOR DELETE
  USING (true);

-- Função para incrementar cliques de produtos
CREATE OR REPLACE FUNCTION increment_product_clicks(product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_affiliate_products
  SET cliques = cliques + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
