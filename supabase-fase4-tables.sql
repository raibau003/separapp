-- ============================================
-- FASE 4: Tablas de Mensajería y Manutención
-- ============================================
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  filtered BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_family_id ON messages(family_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- RLS para messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages from their family" ON messages;
CREATE POLICY "Users can view messages from their family"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = messages.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages to their family" ON messages;
CREATE POLICY "Users can send messages to their family"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM families
      WHERE families.id = messages.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update read status of messages in their family" ON messages;
CREATE POLICY "Users can update read status of messages in their family"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = messages.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = messages.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

-- IMPORTANTE: No hay política de DELETE - los mensajes son inmutables

-- 2. Tabla de pagos de manutención
CREATE TABLE IF NOT EXISTS manutencion_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_by UUID REFERENCES profiles(id),
  paid_at TIMESTAMP WITH TIME ZONE,
  recurrence TEXT NOT NULL DEFAULT 'monthly' CHECK (recurrence IN ('monthly', 'biweekly', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para manutencion_payments
CREATE INDEX IF NOT EXISTS idx_manutencion_payments_family_id ON manutencion_payments(family_id);
CREATE INDEX IF NOT EXISTS idx_manutencion_payments_due_date ON manutencion_payments(due_date DESC);
CREATE INDEX IF NOT EXISTS idx_manutencion_payments_status ON manutencion_payments(status);

-- RLS para manutencion_payments
ALTER TABLE manutencion_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view manutencion payments from their family" ON manutencion_payments;
CREATE POLICY "Users can view manutencion payments from their family"
  ON manutencion_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = manutencion_payments.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create manutencion payments for their family" ON manutencion_payments;
CREATE POLICY "Users can create manutencion payments for their family"
  ON manutencion_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = manutencion_payments.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update manutencion payments for their family" ON manutencion_payments;
CREATE POLICY "Users can update manutencion payments for their family"
  ON manutencion_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = manutencion_payments.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

-- ============================================
-- Funciones útiles
-- ============================================

-- Función para marcar automáticamente pagos vencidos
CREATE OR REPLACE FUNCTION mark_overdue_payments()
RETURNS void AS $$
BEGIN
  UPDATE manutencion_payments
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar la función diariamente (configurar en Supabase Cron Jobs)
-- Configurar en: Database > Cron Jobs
-- Nombre: mark-overdue-payments
-- Schedule: 0 0 * * * (diario a medianoche)
-- SQL: SELECT mark_overdue_payments();

-- ============================================
-- Verificación
-- ============================================

-- Ver tablas creadas
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('messages', 'manutencion_payments');

-- Ver políticas RLS
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('messages', 'manutencion_payments')
ORDER BY tablename, policyname;
