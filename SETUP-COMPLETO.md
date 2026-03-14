# 🚀 SETUP COMPLETO - SEPARAPP APP

## ✅ Estado Actual del Proyecto

### Lo que ya está configurado:
- ✅ Proyecto Expo con TypeScript
- ✅ Todas las dependencias instaladas
- ✅ Navegación y autenticación básica
- ✅ Estructura de carpetas completa
- ✅ Tipos TypeScript generados
- ✅ Stores y hooks configurados
- ✅ Git conectado a GitHub

### ⚠️ Falta configurar:
- ❌ Ejecutar el schema SQL en Supabase
- ❌ Crear datos de prueba
- ❌ Implementar módulos completos (Gastos, Manutención)

---

## 📋 PASO 1: Configurar Base de Datos en Supabase

### Opción A: Ejecutar SQL manualmente (Recomendado)

1. **Abre tu navegador** y ve a: https://supabase.com
2. **Inicia sesión** con tu cuenta
3. **Selecciona el proyecto**: `separapp`
4. **En el menú lateral izquierdo**, busca **"SQL Editor"**
5. **Haz clic en "+ New query"**
6. **Copia el contenido** del archivo `supabase-schema.sql` (está en la raíz del proyecto)
7. **Pégalo en el editor**
8. **Haz clic en "Run"** para ejecutar
9. ✅ **Listo!** Deberías ver "Success. No rows returned"

### Opción B: Usar Supabase CLI (Avanzado)

Si tienes Supabase CLI instalado:

```bash
# Instalar Supabase CLI (si no lo tienes)
brew install supabase/tap/supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref srmhqcjbngrxmhnwfedq

# Ejecutar el schema
supabase db push

# O ejecutar el archivo directamente
psql "postgresql://postgres:[YOUR-PASSWORD]@db.srmhqcjbngrxmhnwfedq.supabase.co:5432/postgres" -f supabase-schema.sql
```

---

## 📊 PASO 2: Verificar que la BD está configurada

Ejecuta este SQL en el SQL Editor de Supabase para verificar:

```sql
-- Ver todas las tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deberías ver:
-- - calendar_events
-- - children
-- - expenses
-- - families
-- - family_members
-- - maintenance_payments
-- - messages
-- - profiles
```

---

## 🎯 PASO 3: Crear datos de prueba (Opcional)

Si quieres datos de ejemplo para probar:

1. En el **SQL Editor**, ejecuta el contenido de `supabase-seed.sql`
2. Esto creará:
   - 2 familias de prueba
   - 3 hijos de ejemplo
   - Estructura base para gastos y manutención

---

## 🧪 PASO 4: Probar la app

Una vez configurada la BD:

```bash
cd /Users/javiercorrea/separapp

# Iniciar el servidor de desarrollo
npm start

# O para web
npm run web
```

### Crear tu primer usuario:

1. Abre la app
2. Ve a "Registro"
3. Crea una cuenta con:
   - Email: tu-email@ejemplo.com
   - Contraseña: mínimo 6 caracteres
   - Nombre completo: Tu Nombre

4. El perfil se creará automáticamente en la tabla `profiles` gracias al trigger SQL

---

## 📱 PRÓXIMOS PASOS - ETAPAS DE DESARROLLO

### Etapa 1: ✅ Configuración Base (COMPLETADA)
- Base de datos SQL
- Autenticación
- Navegación

### Etapa 2: 💰 Módulo Gastos (SIGUIENTE)
- Lista de gastos
- Formulario crear gasto
- Integración cámara + OCR
- Flujo aprobación/rechazo
- Notificaciones

### Etapa 3: 💳 Módulo Manutención
- Configuración manutención
- Historial pagos
- Alertas vencimiento

### Etapa 4: 📅 Módulo Calendario
- Calendario custodia
- Eventos
- Intercambios

### Etapa 5: 💬 Módulo Mensajería
- Chat interno
- Filtro IA anti-conflicto
- Historial inmutable

### Etapa 6: 🎨 Polish & Testing
- Mejoras UI/UX
- Testing completo
- Optimizaciones

---

## 🔑 Credenciales del Proyecto

```env
EXPO_PUBLIC_SUPABASE_URL=https://srmhqcjbngrxmhnwfedq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_WbaUHBidVdi04zrBPJZ8Ug_AdD6rMNC
```

**GitHub**: https://github.com/raibau003/separapp.git

---

## ❓ Troubleshooting

### Error: "relation does not exist"
- Significa que no se ejecutó el schema SQL
- Ve al SQL Editor y ejecuta `supabase-schema.sql`

### Error: "permission denied"
- Verifica que RLS esté activado
- Verifica que las políticas estén creadas

### No aparecen datos
- Verifica que el usuario esté autenticado
- Verifica que el usuario pertenezca a una familia
- Revisa las políticas RLS en Supabase

---

## 📞 ¿Necesitas ayuda?

Si algo no funciona, revisa:
1. Logs de Supabase (pestaña "Logs" en el dashboard)
2. Consola del navegador/app (errores JavaScript)
3. SQL Editor → ejecuta queries de verificación

¡Listo para construir! 🚀
