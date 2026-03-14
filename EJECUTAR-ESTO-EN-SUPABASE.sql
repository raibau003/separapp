-- ============================================
-- ÓRBITA APP - SCHEMA COMPLETO
-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com
-- 2. Abre el proyecto "orbita-app"
-- 3. Ve a SQL Editor (menú izquierdo)
-- 4. Haz clic en "+ New query"
-- 5. Copia TODO este archivo y pégalo
-- 6. Haz clic en "Run"
-- 7. ¡Listo! Verás "Success. No rows returned"
-- ============================================

-- TABLAS PRINCIPALES
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('padre', 'madre', 'hijo', 'mediador', 'juez')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
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
);

CREATE TABLE IF NOT EXISTS maintenance_payments (
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
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  original_content TEXT,
  ai_filtered BOOLEAN NOT NULL DEFAULT false,
  ai_suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('custody', 'activity', 'school', 'exchange')),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_children_family_id ON children(family_id);
CREATE INDEX IF NOT EXISTS idx_expenses_family_id ON expenses(family_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_payments_family_id ON maintenance_payments(family_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_payments_status ON maintenance_payments(status);
CREATE INDEX IF NOT EXISTS idx_messages_family_id ON messages(family_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_family_id ON calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON calendar_events(start_date, end_date);

-- HABILITAR RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS - PROFILES
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POLÍTICAS RLS - FAMILY_MEMBERS
CREATE POLICY "Users can view family members of their families" ON family_members FOR SELECT
USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id = family_members.family_id AND fm.user_id = auth.uid()));

-- POLÍTICAS RLS - FAMILIES
CREATE POLICY "Users can view their families" ON families FOR SELECT
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = families.id AND family_members.user_id = auth.uid()));

-- POLÍTICAS RLS - CHILDREN
CREATE POLICY "Users can view children of their families" ON children FOR SELECT
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = children.family_id AND family_members.user_id = auth.uid()));

CREATE POLICY "Parents can insert children" ON children FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = children.family_id AND family_members.user_id = auth.uid() AND family_members.role IN ('padre', 'madre')));

CREATE POLICY "Parents can update children" ON children FOR UPDATE
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = children.family_id AND family_members.user_id = auth.uid() AND family_members.role IN ('padre', 'madre')));

-- POLÍTICAS RLS - EXPENSES
CREATE POLICY "Users can view expenses of their families" ON expenses FOR SELECT
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = expenses.family_id AND family_members.user_id = auth.uid()));

CREATE POLICY "Parents can create expenses" ON expenses FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = expenses.family_id AND family_members.user_id = auth.uid() AND family_members.role IN ('padre', 'madre')) AND declared_by = auth.uid());

CREATE POLICY "Parents can update expenses" ON expenses FOR UPDATE
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = expenses.family_id AND family_members.user_id = auth.uid() AND family_members.role IN ('padre', 'madre')));

-- POLÍTICAS RLS - MAINTENANCE_PAYMENTS
CREATE POLICY "Users can view maintenance payments of their families" ON maintenance_payments FOR SELECT
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = maintenance_payments.family_id AND family_members.user_id = auth.uid()));

CREATE POLICY "Parents can manage maintenance payments" ON maintenance_payments FOR ALL
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = maintenance_payments.family_id AND family_members.user_id = auth.uid() AND family_members.role IN ('padre', 'madre')));

-- POLÍTICAS RLS - MESSAGES
CREATE POLICY "Users can view messages of their families" ON messages FOR SELECT
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = messages.family_id AND family_members.user_id = auth.uid()));

CREATE POLICY "Parents can create messages" ON messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = messages.family_id AND family_members.user_id = auth.uid() AND family_members.role IN ('padre', 'madre')) AND sender_id = auth.uid());

-- POLÍTICAS RLS - CALENDAR_EVENTS
CREATE POLICY "Users can view calendar events of their families" ON calendar_events FOR SELECT
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = calendar_events.family_id AND family_members.user_id = auth.uid()));

CREATE POLICY "Parents can manage calendar events" ON calendar_events FOR ALL
USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.family_id = calendar_events.family_id AND family_members.user_id = auth.uid() AND family_members.role IN ('padre', 'madre')));

-- FUNCIÓN: Crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FUNCIÓN: Actualizar pagos atrasados
CREATE OR REPLACE FUNCTION update_late_payments()
RETURNS void AS $$
BEGIN
  UPDATE maintenance_payments SET status = 'late' WHERE status = 'pending' AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ✅ LISTO! Si ves "Success", todo está configurado
-- ============================================
