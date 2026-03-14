-- ============================================
-- FASE 2: Tablas de Wallet y Pagos
-- ============================================
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Tabla de métodos de pago (tarjetas)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_pm_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_customer_id ON payment_methods(stripe_customer_id);

-- RLS para payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own payment methods" ON payment_methods;
CREATE POLICY "Users can insert their own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;
CREATE POLICY "Users can update their own payment methods"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own payment methods" ON payment_methods;
CREATE POLICY "Users can delete their own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Tabla de transacciones del wallet
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('charge', 'refund', 'adjustment')),
  from_user_id UUID REFERENCES profiles(id),
  to_user_id UUID REFERENCES profiles(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CLP',
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para wallet_transactions
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_family_id ON wallet_transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_from_user ON wallet_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_to_user ON wallet_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_stripe_pi ON wallet_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- RLS para wallet_transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transactions from their family" ON wallet_transactions;
CREATE POLICY "Users can view transactions from their family"
  ON wallet_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = wallet_transactions.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert transactions for their family" ON wallet_transactions;
CREATE POLICY "Users can insert transactions for their family"
  ON wallet_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = wallet_transactions.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

-- 3. Tabla de liquidaciones mensuales
CREATE TABLE IF NOT EXISTS monthly_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  settlement_month DATE NOT NULL,
  padre_a_id UUID NOT NULL REFERENCES profiles(id),
  padre_b_id UUID NOT NULL REFERENCES profiles(id),
  padre_a_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  padre_b_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  difference NUMERIC(10, 2) NOT NULL,
  debtor_id UUID REFERENCES profiles(id),
  creditor_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_id UUID REFERENCES wallet_transactions(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, settlement_month)
);

-- Índices para monthly_settlements
CREATE INDEX IF NOT EXISTS idx_monthly_settlements_family_id ON monthly_settlements(family_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settlements_month ON monthly_settlements(settlement_month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_settlements_status ON monthly_settlements(status);

-- RLS para monthly_settlements
ALTER TABLE monthly_settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view settlements from their family" ON monthly_settlements;
CREATE POLICY "Users can view settlements from their family"
  ON monthly_settlements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = monthly_settlements.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert settlements for their family" ON monthly_settlements;
CREATE POLICY "Users can insert settlements for their family"
  ON monthly_settlements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = monthly_settlements.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update settlements for their family" ON monthly_settlements;
CREATE POLICY "Users can update settlements for their family"
  ON monthly_settlements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = monthly_settlements.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

-- ============================================
-- Verificación
-- ============================================

-- Ver tablas creadas
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('payment_methods', 'wallet_transactions', 'monthly_settlements');

-- Ver políticas RLS
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('payment_methods', 'wallet_transactions', 'monthly_settlements')
ORDER BY tablename, policyname;
