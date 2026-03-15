# 🎯 SeparApp

**Gestión inteligente para padres separados**

Una aplicación móvil completa para facilitar la coparentalidad entre padres separados, con gestión de gastos, calendario compartido, mensajería moderada por IA, y sistema de pagos automatizados.

> **Estado del Proyecto:** 79% Completado | 3.5 de 5 fases terminadas ✅

---

## ✨ Características Principales

### 🔐 Autenticación Dual
- ✅ Login con Google (Firebase Auth)
- ✅ Email/Password (Supabase Auth)
- ✅ Sincronización automática entre proveedores
- ✅ Gestión segura de sesiones

### 💰 Sistema de Wallet y Pagos
- ✅ Integración completa con Stripe
- ✅ Gestión de tarjetas de crédito/débito
- ✅ Liquidaciones mensuales automáticas (división 50/50)
- ✅ Historial completo de transacciones
- ✅ Cobros automáticos el día 1 de cada mes
- ✅ Sistema de reintentos para pagos fallidos (7 días)

### 📊 Gestión de Gastos
- ✅ OCR inteligente con OpenAI Vision API
- ✅ Escaneo automático de boletas
- ✅ Detección automática de monto, fecha y comercio
- ✅ Aprobación dual de gastos
- ⏳ Export PDF (pendiente)

### 💵 Manutención
- ✅ Pagos recurrentes (mensual, quincenal, semanal)
- ✅ Alertas automáticas (3 días antes, el día, 1 día después)
- ✅ Historial completo de pagos
- ✅ Estadísticas en tiempo real
- ✅ Marcado automático de vencidos

### 📅 Calendario Compartido
- ✅ 5 tipos de eventos (Custodia, Médico, Escolar, Actividad, Otro)
- ✅ Código de colores por tipo
- ✅ Notificaciones 1 día antes de cada evento
- ✅ Vista mensual interactiva con react-native-calendars
- ✅ Sincronización en tiempo real
- ⏳ Modal crear/editar eventos (pendiente)

### 💬 Mensajería Inteligente
- ✅ Chat en tiempo real (Supabase Realtime)
- ✅ Filtro de IA para moderación de contenido (GPT-4o-mini)
- ✅ 3 niveles de seguridad (safe, warning, blocked)
- ✅ Mensajes inmutables (no se pueden editar ni eliminar)
- ✅ Indicadores de lectura (✓ / ✓✓)
- ✅ Sugerencias de mensajes mejorados por IA

### 🔔 Notificaciones Push
- ✅ Alertas de gastos pendientes
- ✅ Recordatorios de manutención
- ✅ Eventos del calendario
- ✅ Mensajes nuevos
- ✅ Confirmaciones de pago

---

## 🛠 Stack Tecnológico

### Frontend
- **React Native** (v0.76.6) + **Expo** (v52.0.26)
- **Expo Router** (File-based routing)
- **TypeScript** (Strict mode)
- **Zustand** (State management)
- **React Hook Form** + **Zod** (Form validation)
- **react-native-calendars** (Calendar component)
- **expo-linear-gradient** (Gradients)

### Backend & Services
- **Supabase** (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- **Stripe** (Payment processing & webhooks)
- **Firebase Auth** (Google Sign-In)
- **OpenAI API** (GPT-4o-mini Vision for OCR & content moderation)
- **Expo Notifications** (Push notifications)

### Arquitectura
- File-based routing con Expo Router
- Row Level Security (RLS) en todas las tablas
- Edge Functions para lógica serverless
- Cron Jobs para tareas programadas
- Real-time subscriptions para chat y eventos

---

## 📂 Estructura del Proyecto

```
separapp/
├── app/                                 # Rutas (Expo Router)
│   ├── (auth)/
│   │   ├── login.tsx                    # Pantalla de login
│   │   └── _layout.tsx
│   ├── (tabs)/
│   │   ├── index.tsx                    # Dashboard
│   │   ├── gastos.tsx                   # Gestión de gastos
│   │   ├── manutencion.tsx              # Pagos de manutención
│   │   ├── wallet.tsx                   # Wallet y pagos
│   │   ├── calendario.tsx               # Calendario compartido
│   │   ├── mensajes.tsx                 # Chat en tiempo real
│   │   └── _layout.tsx
│   └── _layout.tsx                      # Root layout
├── components/
│   └── wallet/
│       └── AgregarTarjetaModal.tsx      # Modal agregar tarjetas
├── hooks/
│   ├── useAuth.ts                       # Hook autenticación
│   ├── useManutencion.ts                # Hook manutención
│   ├── useMensajeria.ts                 # Hook mensajería
│   └── useCalendario.ts                 # Hook calendario
├── lib/
│   ├── supabase.ts                      # Cliente Supabase
│   ├── firebase.ts                      # Config Firebase
│   ├── authSync.ts                      # Sync auth dual
│   ├── stripe.ts                        # Cliente Stripe
│   ├── settlements.ts                   # Lógica liquidaciones
│   ├── ocr.ts                           # OCR con OpenAI Vision
│   ├── claude.ts                        # Filtro mensajes IA
│   └── notifications.ts                 # Push notifications
├── store/
│   ├── authStore.ts                     # Estado auth
│   └── familyStore.ts                   # Estado familia
├── supabase/functions/                  # Edge Functions
│   ├── create-stripe-customer/
│   ├── attach-payment-method/
│   ├── create-payment-intent/
│   ├── stripe-webhook/
│   ├── monthly-auto-charge/             # Cron: día 1 de cada mes
│   └── retry-failed-charges/            # Cron: diario 12:00 UTC
├── supabase-wallet-tables.sql           # SQL: Wallet (3 tablas)
├── supabase-fase4-tables.sql            # SQL: Messages & Maintenance (2 tablas)
├── supabase-calendario-table.sql        # SQL: Calendar (1 tabla)
├── PROGRESO-IMPLEMENTACION.md           # Progreso detallado
├── package.json
└── app.json
```

---

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js 18+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Cuentas en: Supabase, Stripe, OpenAI, Firebase

### 1. Clonar e Instalar

```bash
git clone https://github.com/raibau003/orbita-app.git
cd separapp
npm install --legacy-peer-deps
```

### 2. Configurar Variables de Entorno

Crear `.env` en la raíz:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://srmhqcjbngrxmhnwfedq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI (para OCR y filtro de mensajes)
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...

# Firebase / Google Sign-In
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...

# EAS (notificaciones push)
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id
```

### 3. Configurar Supabase

#### 3.1 Ejecutar Scripts SQL

En Supabase Dashboard → SQL Editor:

```bash
# 1. Tablas de Wallet
Ejecutar: supabase-wallet-tables.sql

# 2. Tablas de Mensajería y Manutención
Ejecutar: supabase-fase4-tables.sql

# 3. Tabla de Calendario
Ejecutar: supabase-calendario-table.sql
```

#### 3.2 Configurar Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3.3 Desplegar Edge Functions

```bash
supabase functions deploy create-stripe-customer
supabase functions deploy attach-payment-method
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
supabase functions deploy monthly-auto-charge
supabase functions deploy retry-failed-charges
```

#### 3.4 Configurar Cron Jobs

En Supabase Dashboard → Database → Cron Jobs:

| Nombre | Schedule | SQL |
|--------|----------|-----|
| monthly-auto-charge | `0 0 1 * *` | Ver documentación |
| retry-failed-charges | `0 12 * * *` | Ver documentación |
| mark-overdue-payments | `0 0 * * *` | `SELECT mark_overdue_payments();` |

### 4. Configurar Stripe

1. Dashboard de Stripe → Developers → API Keys
2. Obtener `pk_test_...` y `sk_test_...`
3. Webhooks → Add endpoint:
   - URL: `https://[PROJECT-REF].supabase.co/functions/v1/stripe-webhook`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Obtener Signing secret: `whsec_...`

### 5. Configurar Firebase

1. Console Firebase → Create Project
2. Authentication → Google → Enable
3. Obtener Web Client ID
4. Descargar config files (Android: `google-services.json`, iOS: `GoogleService-Info.plist`)

### 6. Ejecutar la App

```bash
# Desarrollo
npx expo start

# iOS
npx expo run:ios

# Android
npx expo run:android
```

---

## 🧪 Testing

### Tarjetas de Prueba (Stripe)

```
✅ Éxito:
   4242 4242 4242 4242
   CVV: 123
   Exp: 12/34

❌ Declinada:
   4000 0000 0000 0002
```

### Testing OCR

Usar fotos reales de boletas con montos, fechas y nombres de comercios claros.

---

## 📊 Progreso de Implementación

```
FASE 1: ████████████████████ 100% ✅ Infraestructura & Auth
FASE 2: ████████████████████ 100% ✅ Wallet & Pagos
FASE 3: ████████████████████ 100% ✅ Cobros Automáticos
FASE 4: ███████████████████░  95% 🔄 Módulos Completos
FASE 5: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ Testing & Polish

TOTAL:  ███████████████████░  79%
```

**Detalles completos:** [PROGRESO-IMPLEMENTACION.md](./PROGRESO-IMPLEMENTACION.md)

---

## 🗄️ Base de Datos

### Tablas (8 tablas principales)

| Tabla | Descripción | RLS |
|-------|-------------|-----|
| `profiles` | Perfiles de usuarios | ✅ |
| `families` | Grupos familiares | ✅ |
| `expenses` | Gastos compartidos | ✅ |
| `payment_methods` | Tarjetas guardadas | ✅ |
| `wallet_transactions` | Transacciones | ✅ |
| `monthly_settlements` | Liquidaciones | ✅ |
| `manutencion_payments` | Pagos manutención | ✅ |
| `messages` | Chat (inmutable) | ✅ |
| `calendar_events` | Eventos calendario | ✅ |

---

## 🔐 Seguridad

- ✅ JWT Auth (Supabase)
- ✅ Row Level Security en todas las tablas
- ✅ Mensajes moderados por IA
- ✅ HTTPS en todas las conexiones
- ✅ PCI-DSS compliance vía Stripe
- ✅ Secrets en variables de entorno
- ✅ Validación frontend + backend

---

## 🎨 Diseño

- **Colores:** Morado (#6C63FF) + Verde (#4CAF50)
- **Gradientes:** Linear gradients en headers
- **Iconos:** Ionicons
- **Tipografía:** System default
- **Idioma:** Español (Chile)
- **Moneda:** CLP (Peso Chileno)

---

## 📱 Comandos Útiles

```bash
# Desarrollo
npm start                    # Iniciar dev server
npx expo start --clear       # Limpiar caché

# Plataformas
npm run android              # Android
npm run ios                  # iOS
npm run web                  # Web

# Build
eas build --platform android # Build Android
eas build --platform ios     # Build iOS

# Git
git add -A && git commit -m "message"
git push origin main
```

---

## 🔄 Flujos Principales

### Liquidación Mensual Automática

1. **Día 1, 00:00 UTC:** Cron ejecuta `monthly-auto-charge`
2. Calcula gastos aprobados del mes anterior
3. División 50/50 → determina deudor
4. Crea Payment Intent en Stripe con tarjeta predeterminada
5. Registra transacción + settlement
6. Webhook actualiza estado
7. Notificaciones push a ambos padres

### Mensajería con Filtro IA

1. Usuario escribe mensaje
2. `quickFilter()` → validación rápida
3. `filterMessage()` → análisis con GPT-4o-mini
4. ✅ Safe/Warning → Se envía
5. ❌ Blocked → Alert con razón
6. Supabase Realtime → sync instantáneo

---

## 🤝 Contribución

Proyecto privado de gestión de coparentalidad.

---

## 📄 Licencia

Proprietary - Todos los derechos reservados © 2026

---

## 👨‍💻 Créditos

- **Desarrollado por:** Claude (Anthropic) + Equipo SeparApp
- **Stack:** React Native + Expo + Supabase + Stripe
- **IA:** OpenAI GPT-4o-mini Vision

---

## 📞 Soporte

- **Email:** support@separapp.com
- **Docs:** [PROGRESO-IMPLEMENTACION.md](./PROGRESO-IMPLEMENTACION.md)
- **GitHub:** https://github.com/raibau003/orbita-app

---

## 💰 Monetización (Opcional)

SeparApp incluye dos opciones de modelo de negocio:

### Plan A: Gratis (Actual - Implementado)
- ✅ App 100% gratis sin límites
- ✅ Lanzamiento inmediato
- ✅ Máxima adopción
- ❌ Sin ingresos recurrentes

### Plan B: Freemium con Subscripciones
- ✅ Plan Gratis (20 gastos/mes) + Plan Premium ($4.99/mes)
- ✅ Ingresos recurrentes desde día 1
- ✅ Proyección: $1,500-2,500/mes al año 1
- ⏱️ Requiere 3-4 días de implementación adicional

**Documentación de Monetización:**
- **[RESUMEN-PLAN-B.md](./RESUMEN-PLAN-B.md)** - Resumen ejecutivo, proyecciones y comparación
- **[PLAN-SUBSCRIPCIONES.md](./PLAN-SUBSCRIPCIONES.md)** - Plan técnico completo de implementación paso a paso

---

## 🚀 Publicar en App Store y Google Play

¿Listo para lanzar SeparApp al mundo? Consulta nuestras guías completas:

- **[GUIA-DESPLIEGUE.md](./GUIA-DESPLIEGUE.md)** - Guía paso a paso para publicar en Apple App Store y Google Play Store
- **[COMANDOS-DESPLIEGUE.md](./COMANDOS-DESPLIEGUE.md)** - Referencia rápida de comandos EAS para build y submit
- **[CHECKLIST-TESTING.md](./CHECKLIST-TESTING.md)** - Checklist completo de testing pre-producción

**Requisitos para publicar:**
1. ✅ Completar FASE 5 (Testing y Polish)
2. ✅ Cuenta Apple Developer ($99 USD/año)
3. ✅ Cuenta Google Play Console ($25 USD pago único)
4. ✅ Configurar servicios en producción (Supabase, Stripe, Firebase, OpenAI)
5. ⏳ (Opcional) Implementar Plan B de subscripciones

---

**SeparApp** - Haciendo la coparentalidad más simple y organizada 🎯✨
