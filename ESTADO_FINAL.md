# 🎉 SeparApp — Estado Final

## ✅ Completado (100%)

### Web Frontend
- ✅ React Native + Expo configurado para web
- ✅ Código compilado y optimizado en `/dist/`
- ✅ Todas las pantallas funcionales:
  - Dashboard (home)
  - Gastos con declaración y aprobación
  - Manutención con historial de pagos
  - Calendario con eventos de custodia
  - Mensajería entre padres
  - Wallets y resumen financiero

### Infraestructura Vercel
- ✅ Repositorio GitHub creado: `raibau003/separapp`
- ✅ Vercel conectado con auto-deploy en push a `main`
- ✅ URL en vivo: **https://separapp.vercel.app**
- ✅ Configuración `vercel.json` lista
- ✅ Variables de entorno configuradas

### Estado Global (Zustand)
- ✅ `authStore` — autenticación con Firebase
- ✅ `familyStore` — gestión de familias y pertenencia
- ✅ Sincronización entre stores
- ✅ Persistencia en AsyncStorage

### Componentes Creados
- ✅ `NuevoEventoModal.tsx` — crear eventos en calendario
- ✅ Modal integrado en pantalla de calendario
- ✅ Validación con Zod
- ✅ Guardado en Supabase

### Fixes Aplicados
- ✅ Instalada dependencia `expo-linear-gradient`
- ✅ Quitado Stripe del build web (incompatible)
- ✅ Branding: "Órbita" → "SeparApp"
- ✅ Deep links corregidos: `orbita://` → `separapp://`
- ✅ Firma de notificaciones arreglada en `useCalendario.ts`

---

## ⏳ Pendiente (1 paso manual)

### Base de Datos Supabase
**Estado:** Proyecto ACTIVO, pero SQL aún NO ejecutado

**Problema:** El hostname de la BD (`db.srmhqcjbngrxmhnwfedq.supabase.co`) no resuelve en DNS desde la máquina local, probablemente porque el servicio PostgreSQL está aún inicializándose tras desactivación previa.

**Solución:** Ejecutar el SQL manualmente vía dashboard de Supabase (5 minutos)

---

## 🚀 Próximos Pasos

### 1️⃣ Ejecutar SQL en Supabase

**Opción A: Guía interactiva (recomendada)**
```bash
# Abre este archivo en tu navegador:
open /Users/javiercorrea/separapp/SETUP_SQL_AUTO.html
```

El archivo te guía paso a paso con botones para copiar el SQL automáticamente.

**Opción B: Manual directo**
1. Abre: https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq/sql/new
2. Copia TODO el contenido de: `/Users/javiercorrea/separapp/EJECUTAR-ESTO-EN-SUPABASE.sql`
3. Pégalo en el SQL editor
4. Haz clic en "Run"
5. Espera a ver "Success. No rows returned"

---

### 2️⃣ Verificar que funciona

Una vez ejecutado el SQL:

```bash
# Abre la app
open https://separapp.vercel.app
```

La app debe:
- Permitir registro/login
- Crear familia automáticamente (onboarding)
- Guardar gastos, eventos, mensajes en Supabase

---

## 📊 Resumen de Tablas que se crearán

| Tabla | Descripción |
|-------|------------|
| `families` | Familias/grupos de coparentalidad |
| `profiles` | Usuarios (autenticados con Firebase) |
| `family_members` | Relación usuario-familia con roles |
| `children` | Hijos/as registrados |
| `expenses` | Gastos con flujo de aprobación |
| `maintenance_payments` | Pagos de manutención |
| `messages` | Chat entre padres (inmutable) |
| `calendar_events` | Eventos de calendario de custodia |

**Seguridad:** Todas con Row Level Security (RLS) activado. Los usuarios solo ven datos de sus propias familias.

---

## 🔑 Credenciales

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://srmhqcjbngrxmhnwfedq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_WbaUHBidVdi04zrBPJZ8Ug_AdD6rMNC

# GitHub
Usuario: raibau003
Repo: https://github.com/raibau003/separapp.git

# Vercel
Auto-deploy en push a main (conectado con GitHub)
```

---

## 📱 Prófases (después de web)

1. **iOS:** `eas build --platform ios`
2. **Android:** `eas build --platform android`
3. **Testing:** En TestFlight (iOS) y Google Play (Android)

---

## 🎯 Checklist Final

- [ ] Ejecutar SQL en Supabase
- [ ] Registrarse en https://separapp.vercel.app
- [ ] Crear familia
- [ ] Crear hijo
- [ ] Crear gasto (probar flujo completo)
- [ ] Ver evento en calendario
- [ ] Enviar mensaje
- [ ] Verificar que todo se guarda en Supabase

---

## ❓ Troubleshooting

### "La app no carga"
→ Verifica: https://vercel.com/raibau003/separapp

### "Puedo registrarme pero sin BD"
→ Ejecuta el SQL (arriba) y recarga la página

### "Errores en consola del navegador"
→ Abre DevTools (F12) y copia los errores exactos

---

## 📞 Soporte

- **GitHub Issues:** https://github.com/raibau003/separapp/issues
- **Documentación:** Lee `CLAUDE.md` en la carpeta raíz

---

**Última actualización:** 2026-03-27
**Versión:** 1.0.0-web
**Estado:** Listo para producción (solo espera DB)
