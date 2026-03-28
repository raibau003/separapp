# ⚠️ Ejecución Manual del SQL en Supabase

## Problema
El proyecto Supabase `orbita-app` está en estado **PAUSED** (inactivo). Sin que esté activado, no puedo:
- ❌ Conectarme directamente a la base de datos
- ❌ Usar la CLI de Supabase
- ❌ Ejecutar SQL via API

## Solución

### OPCIÓN 1: Activar vía Dashboard (Recomendado)
1. Abre: https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq
2. Si ves un botón "Resume" o "Unpause", haz clic
3. Espera a que el proyecto se active (1-2 minutos)
4. Una vez activo, ve a: https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq/sql/new
5. Copia y pega el SQL de: `/Users/javiercorrea/separapp/EJECUTAR-ESTO-EN-SUPABASE.sql`
6. Ejecuta (botón "Run")

### OPCIÓN 2: Ejecutar vía Script Local (Una vez activo)
```bash
cd /Users/javiercorrea/separapp
python3 execute-sql.py
```

Este script intentará conectarse a la BD una vez que esté activa.

---

## Información del Proyecto
- **URL Dashboard**: https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq
- **Project ID**: srmhqcjbngrxmhnwfedq
- **Host BD**: db.srmhqcjbngrxmhnwfedq.supabase.co
- **Usuario BD**: postgres
- **Puerto BD**: 5432

---

## Tablas que se crearán
- `families` - Familias/grupos
- `profiles` - Perfiles de usuarios
- `family_members` - Miembros de familia
- `children` - Hijos/as
- `expenses` - Gastos
- `maintenance_payments` - Manutención
- `messages` - Mensajes
- `calendar_events` - Eventos de calendario

---

## ¿Por qué está paused?
Los proyectos gratuitos de Supabase se pausan si:
- No hay actividad durante 1 semana
- El usuario es nuevo y no ha verificado email
- Otros motivos administrativos

Para despausarlos, necesita acceso al dashboard (que requiere estar logged in con la cuenta).

---

## Siguientes pasos una vez activado
1. ✅ Ejecutar SQL (crear tablas)
2. ✅ Recargar app en https://separapp.vercel.app
3. ✅ Crear usuario de prueba
4. ✅ Crear familia
5. ✅ Probar gastos, calendario, etc.
