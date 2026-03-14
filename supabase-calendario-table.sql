-- ============================================
-- Tabla de Calendario (calendar_events)
-- ============================================
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('custody', 'medical', 'school', 'activity', 'other')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para calendar_events
CREATE INDEX IF NOT EXISTS idx_calendar_events_family_id ON calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by);

-- RLS para calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view events from their family" ON calendar_events;
CREATE POLICY "Users can view events from their family"
  ON calendar_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = calendar_events.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create events for their family" ON calendar_events;
CREATE POLICY "Users can create events for their family"
  ON calendar_events FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM families
      WHERE families.id = calendar_events.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update events from their family" ON calendar_events;
CREATE POLICY "Users can update events from their family"
  ON calendar_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = calendar_events.family_id
      AND (families.padre_a_id = auth.uid() OR families.padre_b_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete events they created" ON calendar_events;
CREATE POLICY "Users can delete events they created"
  ON calendar_events FOR DELETE
  USING (created_by = auth.uid());

-- ============================================
-- Verificación
-- ============================================

-- Ver tabla creada
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'calendar_events') as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'calendar_events';

-- Ver políticas RLS
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename = 'calendar_events'
ORDER BY policyname;
