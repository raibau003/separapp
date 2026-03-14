# Configuración de Supabase para Órbita App

## 📋 Pasos para configurar la base de datos

### 1. Acceder al proyecto de Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta `raibau003`
3. Abre el proyecto `orbita-app`

### 2. Ejecutar el esquema SQL

1. En el panel de Supabase, ve a **SQL Editor** (icono de base de datos en el menú lateral)
2. Haz clic en **New Query**
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Haz clic en **Run** o presiona `Ctrl/Cmd + Enter`

El script creará:
- ✅ 8 tablas principales
- ✅ Índices para optimizar consultas
- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Políticas de seguridad para cada tabla
- ✅ Trigger para crear perfiles automáticamente
- ✅ Función para actualizar pagos atrasados

### 3. Verificar que las tablas se crearon correctamente

En el panel de Supabase:
1. Ve a **Table Editor**
2. Deberías ver estas tablas:
   - `families`
   - `profiles`
   - `family_members`
   - `children`
   - `expenses`
   - `maintenance_payments`
   - `messages`
   - `calendar_events`

### 4. Generar tipos de TypeScript

Ejecuta este comando en tu terminal local:

```bash
npx supabase gen types typescript --project-id srmhqcjbngrxmhnwfedq > types/database.ts
```

Esto generará los tipos de TypeScript automáticamente desde tu base de datos.

## 🔐 Seguridad (RLS)

Todas las tablas tienen **Row Level Security (RLS)** habilitado. Esto significa:

- Los usuarios **solo pueden ver** datos de sus propias familias
- Los padres pueden crear/editar gastos, pagos, eventos
- Los hijos solo tienen acceso de lectura
- Los mediadores/jueces solo tienen acceso de lectura
- Los mensajes son **inmutables** (no se pueden editar ni borrar)

## 📊 Datos de prueba (opcional)

Si quieres probar la app con datos de ejemplo, ejecuta este SQL después del schema principal:

```sql
-- Crear una familia de prueba
INSERT INTO families (name) VALUES ('Familia González-López');

-- Obtener el ID de la familia (reemplaza este valor con el UUID generado)
-- SELECT id FROM families WHERE name = 'Familia González-López';

-- Los perfiles se crean automáticamente al registrar usuarios en la app
```

## ✅ Siguiente paso

Una vez configurada la base de datos, ejecuta:

```bash
npm start
```

Y ya podrás:
- Registrar usuarios
- Crear familias
- Agregar hijos
- Declarar gastos
- Registrar pagos de manutención

---

**Nota:** Si necesitas resetear la base de datos, puedes borrar todas las tablas desde el Table Editor y volver a ejecutar el schema SQL.
