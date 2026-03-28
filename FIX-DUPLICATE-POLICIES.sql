-- ============================================
-- FIX: Las políticas ya existen, hay que dropearlas primero
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view family members of their families" ON family_members;

DROP POLICY IF EXISTS "Users can view their families" ON families;

DROP POLICY IF EXISTS "Users can view children of their families" ON children;
DROP POLICY IF EXISTS "Parents can insert children" ON children;
DROP POLICY IF EXISTS "Parents can update children" ON children;

DROP POLICY IF EXISTS "Users can view expenses of their families" ON expenses;
DROP POLICY IF EXISTS "Parents can create expenses" ON expenses;
DROP POLICY IF EXISTS "Parents can update expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view maintenance payments of their families" ON maintenance_payments;
DROP POLICY IF EXISTS "Parents can manage maintenance payments" ON maintenance_payments;

DROP POLICY IF EXISTS "Users can view messages of their families" ON messages;
DROP POLICY IF EXISTS "Parents can create messages" ON messages;

DROP POLICY IF EXISTS "Users can view calendar events of their families" ON calendar_events;
DROP POLICY IF EXISTS "Parents can manage calendar events" ON calendar_events;

-- ============================================
-- RECREAR POLÍTICAS RLS
-- ============================================

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

-- ============================================
-- ✅ LISTO! Las políticas han sido recreadas correctamente
-- ============================================
