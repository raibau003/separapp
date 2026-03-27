# 🚀 Setup de SeparApp - Instrucciones

## ⚠️ Estado Actual

El código está deployado en Vercel, pero la base de datos necesita ser inicializada manualmente.

**Proyecto Supabase**: `orbita-app` (srmhqcjbngrxmhnwfedq)
**Estado**: PAUSED - Necesita ser activado

---

## 📋 Pasos para Activar

### 1. Activar Proyecto Supabase
1. Ve a: https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq
2. Haz clic en el proyecto (si está paused)
3. Búsca la opción "Resume project" o similar
4. Confirma la activación

### 2. Crear Tablas de Base de Datos
Una vez que el proyecto esté activo:

1. Ve a: https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq/sql/new
2. Copia el contenido completo de este archivo: `EJECUTAR-ESTO-EN-SUPABASE.sql`
3. Pégalo en el SQL Editor
4. Haz clic en **"Run"**
5. Espera a que aparezca: **"Success. No rows returned"**

### 3. Verificar Tablas
Para verificar que se crearon correctamente:
1. Ve a: https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq/editor
2. Deberías ver estas tablas en el panel izquierdo:
   - `families`
   - `profiles`
   - `family_members`
   - `children`
   - `expenses`
   - `maintenance_payments`
   - `messages`
   - `calendar_events`

---

## 🌐 URL de Vercel

Próximamente (una vez activadas las tablas):
```
https://separapp.vercel.app
```

---

## 💻 Para Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# O con Expo:
npx expo start --web
```

---

## 🔐 Credenciales

**Proyecto Supabase**:
- ID: `srmhqcjbngrxmhnwfedq`
- URL: `https://srmhqcjbngrxmhnwfedq.supabase.co`
- Anon Key: `sb_publishable_WbaUHBidVdi04zrBPJZ8Ug_AdD6rMNC`

---

## ✅ Checklist

- [ ] Proyecto Supabase activado
- [ ] Tablas creadas exitosamente
- [ ] App funcionando en web (Vercel)
- [ ] Login funciona
- [ ] Crear familia funciona
- [ ] Crear gasto funciona
- [ ] Calendario funciona

---

## 🆘 Problemas Comunes

### "Database connection error"
→ Verifica que las tablas se hayan creado correctamente en Supabase

### "No hay familia configurada"
→ Crea una familia en la app o usa el dashboard de Supabase para insertar un registro en `families`

### "Error al subir archivo"
→ Las buckets de storage aún no están configuradas (paso futuro)

---

**Última actualización**: 2026-03-27
**Estado**: Setup en progreso - Esperando activación de BD
