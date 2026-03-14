-- ============================================
-- DATOS DE PRUEBA PARA ÓRBITA APP
-- ============================================
-- Este script crea datos de ejemplo para testing
-- IMPORTANTE: Ejecutar DESPUÉS de supabase-schema.sql

-- ============================================
-- NOTA: Los perfiles de usuarios se crean automáticamente
-- cuando te registras en la app a través de Supabase Auth
-- ============================================

-- Crear familias de prueba
INSERT INTO families (id, name) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'Familia González-López'),
  ('f2222222-2222-2222-2222-222222222222', 'Familia Martínez-Silva');

-- Nota: Para agregar miembros a las familias, primero debes registrar usuarios
-- a través de la app. Luego puedes ejecutar:

-- Ejemplo de cómo agregar miembros (reemplaza los UUIDs con los IDs reales de tus usuarios):
-- INSERT INTO family_members (family_id, user_id, role) VALUES
--   ('f1111111-1111-1111-1111-111111111111', 'tu-user-id-aqui', 'padre'),
--   ('f1111111-1111-1111-1111-111111111111', 'otro-user-id-aqui', 'madre');

-- Crear hijos de prueba
INSERT INTO children (family_id, full_name, birth_date) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'Sofía González', '2015-05-20'),
  ('f1111111-1111-1111-1111-111111111111', 'Mateo González', '2018-08-12'),
  ('f2222222-2222-2222-2222-222222222222', 'Valentina Martínez', '2016-03-15');

-- Crear gastos de ejemplo (reemplaza declared_by con tu user_id)
-- INSERT INTO expenses (family_id, child_id, declared_by, amount, category, description) VALUES
--   ('f1111111-1111-1111-1111-111111111111',
--    (SELECT id FROM children WHERE full_name = 'Sofía González'),
--    'tu-user-id-aqui',
--    25000,
--    'educacion',
--    'Útiles escolares para el nuevo año');

-- Crear configuración de manutención (reemplaza paid_by con tu user_id)
-- INSERT INTO maintenance_payments (family_id, amount, frequency, due_date) VALUES
--   ('f1111111-1111-1111-1111-111111111111',
--    150000,
--    'mensual',
--    '2026-04-01');

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

-- Ver familias creadas
SELECT * FROM families;

-- Ver hijos creados
SELECT c.full_name, c.birth_date, f.name as familia
FROM children c
JOIN families f ON c.family_id = f.id;

-- Ver perfiles de usuarios registrados
SELECT id, email, full_name, created_at FROM profiles;
