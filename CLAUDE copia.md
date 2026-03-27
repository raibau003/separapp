# CLAUDE.md — SeparApp

> Este archivo es el contexto permanente del proyecto. Léelo completo al inicio de cada sesión antes de escribir cualquier código.

---

## ¿Qué es SeparApp?

**SeparApp** es una app de coparentalidad para padres separados con hijos en LATAM (Chile, Argentina, México, España).

El concepto: los hijos son el centro. Los dos padres orbitan alrededor de ellos.
**Tagline:** *"Dos mundos, un centro"*

El problema que resuelve: padres separados que hoy coordinan por WhatsApp — gastos, manutención, calendario de custodia, tareas del colegio — sin registro formal, sin historial legal, con mucho conflicto. SeparApp reemplaza ese caos con una herramienta estructurada, con historial inmutable y valor legal.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Mobile (iOS + Android) | React Native + Expo |
| Web (PC / navegador) | React Native Web + Expo Router |
| Lenguaje | TypeScript (strict) |
| Navegación | Expo Router (file-based) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Deploy web | Vercel (auto-deploy desde GitHub) |
| Build mobile | Expo EAS Build |
| IA mensajería | Claude API (Anthropic) |
| OCR boletas | ML Kit (expo-camera + vision) |
| Estado global | Zustand |
| Formularios | React Hook Form + Zod |

---

## Credenciales y configuración

```env
EXPO_PUBLIC_SUPABASE_URL=https://srmhqcjbngrxmhnwfedq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_WbaUHBidVdi04zrBPJZ8Ug_AdD6rMNC
```

**Cuentas:**
- GitHub: `raibau003` — repo: `https://github.com/raibau003/separapp.git`
- Supabase: proyecto `separapp` — org `raibau003's Org`
- Expo: `raibau003`
- Vercel: conectado con GitHub (auto-deploy en push a `main`)

**App config:**
- `name`: SeparApp
- `slug`: separapp
- `owner`: raibau003
- `bundleIdentifier` (iOS): com.raibau003.separapp
- `package` (Android): com.raibau003.separapp

---

## Estructura de carpetas

```
separapp/
├── app/                        # Rutas (Expo Router - file-based)
│   ├── (auth)/                 # Login, registro, recuperar contraseña
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                 # Navegación principal (tabs)
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Dashboard / Home
│   │   ├── gastos.tsx          # Módulo gastos
│   │   ├── manutencion.tsx     # Módulo manutención
│   │   ├── calendario.tsx      # Módulo calendario
│   │   └── mensajes.tsx        # Módulo mensajería
│   ├── _layout.tsx             # Root layout
│   └── +not-found.tsx
├── components/                 # Componentes reutilizables
│   ├── ui/                     # Botones, inputs, cards, modales
│   ├── gastos/                 # Componentes del módulo gastos
│   ├── manutencion/            # Componentes del módulo manutención
│   ├── calendario/             # Componentes del módulo calendario
│   └── mensajes/               # Componentes del módulo mensajería
├── hooks/                      # Custom hooks
│   ├── useAuth.ts
│   ├── useGastos.ts
│   ├── useManutencion.ts
│   └── useCalendario.ts
├── lib/                        # Utilidades y configuración
│   ├── supabase.ts             # Cliente Supabase
│   ├── claude.ts               # Cliente Claude API (filtro IA)
│   └── utils.ts
├── types/                      # TypeScript types e interfaces
│   ├── database.ts             # Tipos generados de Supabase
│   └── app.ts                  # Tipos propios de la app
├── store/                      # Estado global (Zustand)
│   ├── authStore.ts
│   ├── gastosStore.ts
│   └── calendarStore.ts
└── assets/                     # Imágenes, fuentes, íconos
```

---

## Roles y permisos

| Rol | Acceso |
|-----|--------|
| `padre` / `madre` | Acceso completo: declarar gastos, aprobar, pagar, ver todo |
| `hijo` | Solo lectura: calendario propio, tareas del colegio. Sin gastos ni pagos |
| `mediador` / `juez` | Solo lectura: historial completo, exportar PDFs legales |

Cada familia tiene un `family_id`. Un usuario puede pertenecer a múltiples familias (padre con varios hijos de distintas relaciones).

---

## Módulos del producto

### MVP (Fase 1) — Prioridad máxima

#### Módulo 1: Gastos y boletas
- Sacar foto a boleta con la cámara
- OCR automático: extrae monto, fecha, comercio
- Declarar gasto: asignar a hijo, categoría, descripción
- Flujo de aprobación: el otro padre aprueba / rechaza / pide aclaración
- Notificación push al otro padre cuando hay gasto pendiente
- Resumen mensual por hijo: total declarado, pendiente, saldo a compensar
- **Premium:** exportar PDF del resumen mensual (válido para mediación)

**Categorías de gastos:** educación, salud, ropa, alimentación, deporte/actividades, transporte, otros

#### Módulo 2: Manutención y pagos
- Configurar monto acordado, frecuencia (mensual/quincenal), fecha de inicio
- Registro de pagos: manual (con foto de comprobante) 
- Alertas: 3 días antes del vencimiento, el día, aviso de atraso
- Historial completo con timestamps
- **Premium:** exportar historial como PDF firmado con timestamp (evidencia legal)

---

### Fase 2 — Después del MVP

#### Módulo 3: Calendario de custodia
- Configurar semanas alternas, fines de semana, feriados
- Código de colores por padre (ej: azul = papá, naranja = mamá)
- Proponer cambios de custodia con flujo de aprobación
- Registro de intercambios (pickup log): timestamp + ubicación al recoger/entregar al niño
- Solicitudes de decisiones del día: "¿puede quedarse a dormir donde su amigo?"

#### Módulo 4: Mensajería interna
- Chat entre los dos padres dentro de la app (sin WhatsApp)
- **Filtro IA anti-conflicto (Claude API):** antes de enviar, detecta tono hostil y sugiere reformulación neutra
- Mensajes no editables ni eliminables — historial inmutable
- El historial completo es evidencia legal exportable

#### Módulo 5: Integraciones externas
- **Google Classroom:** ver tareas, fechas de entrega, notas de los hijos
- **Google Calendar:** sincronizar eventos del calendario de custodia

#### Módulo 6: Perfil del hijo
- Info médica: médico de cabecera, alergias, vacunas, medicamentos
- Seguro médico, número de ficha clínica
- Documentos importantes (PDF): carnet de identidad, certificado de nacimiento
- Acceso para ambos padres, historial de cambios

---

## Modelo de negocio (Freemium)

### Plan Gratuito — siempre gratis
- 1 hijo
- Gastos manuales (hasta 10 por mes)
- Manutención manual
- Calendario compartido básico
- Mensajería interna

### Plan Pro — $7.99/mes o $5.99/mes anual
- Hijos ilimitados
- OCR automático de boletas
- Exportar PDF legal (gastos + manutención)
- Google Classroom
- Recordatorios avanzados
- Acceso para mediador/juez

### Plan Par — $9.99/mes (ambos padres)
- Todo de Pro para los dos padres
- Pensado para reducir fricción de "quién paga"

---

## Esquema de base de datos (Supabase)

### Tablas principales

```sql
-- Familias
families (id, name, created_at)

-- Usuarios
users (id, email, full_name, role, avatar_url, created_at)

-- Relación usuario-familia
family_members (id, family_id, user_id, role, created_at)

-- Hijos
children (id, family_id, full_name, birth_date, photo_url, created_at)

-- Gastos
expenses (
  id, family_id, child_id, declared_by,
  amount, currency, category, description,
  receipt_url, ocr_data,
  status (pending|approved|rejected),
  approved_by, approved_at,
  created_at
)

-- Pagos de manutención
maintenance_payments (
  id, family_id,
  amount, currency, frequency,
  due_date, paid_date, paid_by,
  receipt_url, status (pending|paid|late),
  created_at
)

-- Mensajes
messages (
  id, family_id, sender_id,
  content, original_content,
  ai_filtered (boolean), ai_suggestion,
  created_at
  -- NO updated_at — inmutables por diseño
)

-- Eventos de calendario
calendar_events (
  id, family_id, child_id,
  title, start_date, end_date,
  type (custody|activity|school|exchange),
  created_by, created_at
)
```

**Row Level Security (RLS):** SIEMPRE activado. Un usuario solo puede ver datos de sus `family_id`.

---

## Convenciones de código

### Naming
- Componentes: `PascalCase` — `GastoCard.tsx`
- Hooks: `camelCase` con prefijo `use` — `useGastos.ts`
- Tipos: `PascalCase` con sufijo del tipo — `ExpenseType`, `UserRole`
- Constantes: `UPPER_SNAKE_CASE`
- Archivos de utilidad: `camelCase` — `formatCurrency.ts`

### Componentes
- Siempre TypeScript estricto — no usar `any`
- Props siempre tipadas con `interface Props {}`
- Componentes funcionales siempre — no clases
- Estilos con `StyleSheet.create()` — no inline styles salvo dinámicos

### Supabase
- Siempre usar RLS — nunca `service_role` en el cliente
- Queries con tipos generados: `supabase.from('expenses').select()` tipado
- Manejo de errores siempre: `const { data, error } = await supabase...`

### Git
- Commits en inglés con conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Branch `main` = producción
- Branch `dev` = desarrollo activo
- Feature branches: `feat/nombre-del-feature`

---

## Diseño y UX

**Paleta de colores:**
- Primario: `#6C63FF` (violeta — orbital, moderno)
- Secundario: `#FF6584` (coral — calidez, familia)
- Fondo: `#F8F9FA` (gris muy claro)
- Texto: `#2D3436`
- Éxito: `#00B894`
- Error: `#D63031`

**Tipografía:** Inter (sistema) — no usar fuentes custom en v1

**Principios UX:**
- Mobile-first siempre
- En web (desktop), usar sidebar en lugar de tabs
- Pantallas de alta tensión emocional (gastos, manutención) → diseño neutro, sin colores agresivos
- Confirmaciones antes de acciones irreversibles
- Mensajes de error en español claro, sin jerga técnica

---

## Comandos útiles

```bash
# Desarrollo
npx expo start              # Arrancar dev server
npx expo start --web        # Solo web

# Build
eas build --platform ios    # Build iOS
eas build --platform android # Build Android
eas build --platform all    # Ambos

# Supabase
npx supabase gen types typescript --project-id srmhqcjbngrxmhnwfedq > types/database.ts

# Deploy web
git push origin main        # Vercel auto-deploya
```

---

## Contexto de negocio

- **Mercado objetivo:** Chile, Argentina, México, España
- **Competencia principal:** coParenter ($12.99/mes, sin plan gratis), OurFamilyWizard ($10.99/mes)
- **Ventaja competitiva:** precio menor, plan gratis real, IA en mensajería, Google Classroom, foco en LATAM/español
- **Problema crítico de adopción:** ambos padres deben usar la app — diseñar onboarding que facilite invitar al otro padre desde el primer uso
- **Valor legal:** el historial inmutable de mensajes, gastos y pagos tiene valor ante mediadores y jueces — esto es un diferenciador clave en el marketing

---

## Lo que NO hacer

- No guardar `service_role` key en el cliente
- No desactivar RLS en ninguna tabla
- No usar `any` en TypeScript
- No escribir estilos inline (salvo valores dinámicos)
- No hacer queries sin manejo de error
- No commitear `.env` al repo
- No usar librerías no listadas en el stack sin consultar primero
