import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Missing Supabase credentials' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const client = createClient(supabaseUrl, supabaseServiceKey);

  // SQL para crear las tablas
  const sqlStatements = [
    // Familias
    `CREATE TABLE IF NOT EXISTS families (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Perfiles
    `CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Miembros de familia
    `CREATE TABLE IF NOT EXISTS family_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('padre', 'madre', 'hijo', 'mediador', 'juez')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(family_id, user_id)
    )`,

    // Hijos
    `CREATE TABLE IF NOT EXISTS children (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      birth_date DATE NOT NULL,
      photo_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Gastos
    `CREATE TABLE IF NOT EXISTS expenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      declared_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      amount NUMERIC(10, 2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CLP' CHECK (currency IN ('CLP', 'ARS', 'MXN', 'EUR')),
      category TEXT NOT NULL CHECK (category IN ('educacion', 'salud', 'ropa', 'alimentacion', 'deporte', 'transporte', 'otros')),
      description TEXT NOT NULL,
      receipt_url TEXT,
      ocr_data JSONB,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      approved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Pagos de manutención
    `CREATE TABLE IF NOT EXISTS maintenance_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      amount NUMERIC(10, 2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CLP' CHECK (currency IN ('CLP', 'ARS', 'MXN', 'EUR')),
      frequency TEXT NOT NULL CHECK (frequency IN ('mensual', 'quincenal')),
      due_date DATE NOT NULL,
      paid_date DATE,
      paid_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      receipt_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Mensajes
    `CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      original_content TEXT,
      ai_filtered BOOLEAN NOT NULL DEFAULT false,
      ai_suggestion TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Eventos de calendario
    `CREATE TABLE IF NOT EXISTS calendar_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      child_id UUID REFERENCES children(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('custody', 'activity', 'school', 'exchange')),
      created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Índices
    `CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id)`,
    `CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_children_family_id ON children(family_id)`,
    `CREATE INDEX IF NOT EXISTS idx_expenses_family_id ON expenses(family_id)`,
    `CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status)`,
    `CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_maintenance_payments_family_id ON maintenance_payments(family_id)`,
    `CREATE INDEX IF NOT EXISTS idx_maintenance_payments_status ON maintenance_payments(status)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_family_id ON messages(family_id)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_calendar_events_family_id ON calendar_events(family_id)`,
    `CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON calendar_events(start_date, end_date)`,

    // Habilitar RLS
    `ALTER TABLE families ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE family_members ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE children ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE expenses ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE maintenance_payments ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE messages ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY`,
  ];

  try {
    for (const sql of sqlStatements) {
      const { error } = await client.rpc('execute', { statement: sql });
      if (error) console.log(`Warning: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ message: 'Database initialized successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
