# 🧪 Guía Práctica de Testing - SeparApp

**Objetivo:** Ejecutar testing sistemático antes del lanzamiento
**Tiempo estimado:** 3-5 días
**Basado en:** [CHECKLIST-TESTING.md](./CHECKLIST-TESTING.md)

---

## 🎯 Estrategia de Testing

### Niveles de prioridad
- **🔴 Crítico:** Bloqueante para lanzamiento
- **🟡 Importante:** Debe funcionar pero no bloqueante
- **🟢 Nice to have:** Mejoras futuras

---

## 📱 TESTING PASO A PASO

### DÍA 1: Setup + Autenticación + Wallet

#### Setup Inicial (30 min)
```bash
# 1. Limpiar y rebuild
cd /Users/javiercorrea/separapp
npx expo start --clear

# 2. Testear en ambas plataformas
npm run ios    # Si tienes Mac
npm run android # Android

# 3. Verificar que inicia sin errores
```

#### 1. Autenticación 🔴 CRÍTICO (1-2 horas)

**1.1 Registro con Email**
```
Pasos:
1. Abrir app
2. Ir a "Crear cuenta"
3. Email: test1@separapp.com
4. Password: TestPass123!
5. Confirmar password: TestPass123!
6. Click "Registrarse"

Verificar:
✅ Usuario creado correctamente
✅ Redirige a app principal
✅ Usuario aparece en Supabase Dashboard > Auth > Users
✅ Perfil creado en tabla `profiles`
```

**1.2 Login con Email**
```
Pasos:
1. Logout
2. Email: test1@separapp.com
3. Password: TestPass123!
4. Click "Iniciar Sesión"

Verificar:
✅ Login exitoso
✅ Redirige a app principal
✅ Datos del usuario cargados
```

**1.3 Login con Google** (si tienes cuenta Google de prueba)
```
Pasos:
1. Logout
2. Click "Continuar con Google"
3. Seleccionar cuenta
4. Autorizar

Verificar:
✅ Login exitoso
✅ Usuario sincronizado en Supabase
✅ `firebase_uid` guardado en profiles
✅ `auth_provider` = 'google'
```

**1.4 Persistencia de sesión**
```
Pasos:
1. Login exitoso
2. Cerrar app completamente (force quit)
3. Reabrir app

Verificar:
✅ Sigue logueado (no pide credenciales)
✅ Datos cargados correctamente
```

**1.5 Logout**
```
Pasos:
1. Ir a perfil/configuración
2. Click "Cerrar Sesión"

Verificar:
✅ Sesión cerrada
✅ Redirige a login
✅ No quedan datos en memoria
```

#### 2. Wallet & Stripe 🔴 CRÍTICO (2-3 horas)

**2.1 Configurar Stripe en modo test**
```
Verificar en .env:
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**2.2 Agregar tarjeta de prueba**
```
Pasos:
1. Ir a tab "Wallet"
2. Click "Agregar Tarjeta"
3. Número: 4242 4242 4242 4242
4. Expiración: 12/34
5. CVV: 123
6. ZIP: 12345
7. Marcar como "predeterminada"
8. Click "Guardar"

Verificar:
✅ Loading state visible
✅ Tarjeta se guarda correctamente
✅ Aparece en lista de tarjetas
✅ Badge "Predeterminada" visible
✅ Últimos 4 dígitos: ••••4242
✅ Marca: Visa
✅ Registro en tabla `payment_methods` (Supabase Dashboard)
```

**2.3 Agregar segunda tarjeta (no predeterminada)**
```
Pasos:
1. Click "Agregar Tarjeta"
2. Número: 5555 5555 5555 4444
3. Expiración: 12/34
4. CVV: 123
5. NO marcar como predeterminada
6. Click "Guardar"

Verificar:
✅ Segunda tarjeta guardada
✅ Primera sigue como predeterminada
✅ Ambas visibles en lista
```

**2.4 Cambiar tarjeta predeterminada**
```
Pasos:
1. En tarjeta Mastercard (5444)
2. Click "Establecer como predeterminada"

Verificar:
✅ Mastercard ahora tiene badge "Predeterminada"
✅ Visa pierde el badge
✅ Cambio reflejado en Supabase (is_default)
```

**2.5 Eliminar tarjeta**
```
Pasos:
1. En tarjeta Visa (4242)
2. Click "Eliminar"
3. Confirmar eliminación

Verificar:
✅ Tarjeta desaparece de la lista
✅ Solo queda Mastercard
✅ Registro eliminado de Supabase
```

**2.6 Probar tarjeta declinada**
```
Pasos:
1. Agregar tarjeta: 4000 0000 0000 0002
2. Expiración: 12/34
3. CVV: 123
4. Click "Guardar"

Verificar:
✅ Error mostrado al usuario
✅ Mensaje claro: "Tarjeta declinada"
✅ No se guarda en la base de datos
```

---

### DÍA 2: Gastos + OCR + Manutención

#### 3. Gastos 🔴 CRÍTICO (2-3 horas)

**Preparación: Crear familia e hijo**
```sql
-- Ejecutar en Supabase SQL Editor
-- Crear familia de prueba
INSERT INTO families (id, name) VALUES
('11111111-1111-1111-1111-111111111111', 'Familia Test');

-- Vincular usuario a familia (reemplaza USER_ID con tu ID)
INSERT INTO family_members (family_id, user_id, role) VALUES
('11111111-1111-1111-1111-111111111111', 'TU_USER_ID_AQUI', 'padre');

-- Crear hijo de prueba
INSERT INTO children (family_id, full_name, birth_date) VALUES
('11111111-1111-1111-1111-111111111111', 'Hijo Test', '2015-06-15');
```

**3.1 Crear gasto manual (sin boleta)**
```
Pasos:
1. Ir a tab "Gastos"
2. Click botón "+"
3. Hijo: Seleccionar "Hijo Test"
4. Monto: 5000
5. Moneda: CLP
6. Categoría: Alimentación
7. Descripción: "Útiles escolares"
8. NO agregar boleta
9. Click "Crear Gasto"

Verificar:
✅ Gasto creado exitosamente
✅ Alert "¡Listo! Gasto creado exitosamente"
✅ Aparece en lista de gastos
✅ Estado: Pendiente (badge naranja)
✅ Monto: $5.000
✅ Categoría: Alimentación
✅ Registro en tabla `expenses` (status: 'pending')
```

**3.2 Crear gasto con OCR 🔴 CRÍTICO**
```
Pasos:
1. Click botón "+"
2. Click "Escanear" (botón de cámara)
3. Permitir acceso a cámara
4. Tomar foto de una boleta real (o screenshot de boleta)
5. Click "Usar Esta Foto"
6. Esperar procesamiento OCR (spinner visible)

Verificar:
✅ Cámara se abre correctamente
✅ Foto se captura
✅ Preview se muestra
✅ Spinner "Procesando boleta..." visible
✅ Campo "Monto" se auto-rellena (si detectó)
✅ Campo "Descripción" incluye fecha/comercio (si detectó)
✅ Alert confirma monto detectado

Casos de error OCR:
❓ Si OpenAI falla → Campos quedan vacíos, usuario completa manual
❓ Si no detecta monto → Alert no aparece, usuario ingresa manual
```

**3.3 Aprobar gasto (como otro padre)**
```
Setup: Necesitas crear segundo usuario
Opción 1: Crear cuenta test2@separapp.com
Opción 2: Simular con SQL:

Pasos:
1. En lista de gastos, click en gasto pendiente
2. Se abre modal de detalle
3. Click "Aprobar"
4. Confirmar

Verificar:
✅ Estado cambia a "Aprobado" (badge verde)
✅ `approved_by` = ID del usuario actual
✅ `approved_at` = timestamp actual
✅ Gasto incluido en cálculo de liquidación
```

**3.4 Rechazar gasto**
```
Pasos:
1. Crear otro gasto
2. Click en gasto pendiente
3. Click "Rechazar"
4. Confirmar

Verificar:
✅ Estado cambia a "Rechazado" (badge rojo)
✅ Gasto NO incluido en liquidación
```

**3.5 Ver imagen de boleta**
```
Pasos:
1. Click en gasto que tiene boleta adjunta
2. Modal de detalle se abre
3. Click en imagen de boleta

Verificar:
✅ Imagen se muestra en tamaño completo
✅ Zoom funciona (pellizcar)
✅ Imagen se cargó correctamente de Supabase Storage
```

#### 4. Manutención 🟡 IMPORTANTE (1-2 horas)

**4.1 Crear pago de manutención mensual**
```
Pasos:
1. Ir a tab "Manutención"
2. Click "Nuevo Pago"
3. Monto: 150000
4. Frecuencia: Mensual
5. Fecha vencimiento: Día 5 del próximo mes
6. Click "Crear"

Verificar:
✅ Pago creado
✅ Aparece en lista "Próximos Pagos"
✅ Fecha correcta
✅ Estado: Pendiente
```

**4.2 Marcar pago como pagado**
```
Pasos:
1. Click en pago pendiente
2. Click "Marcar como Pagado"
3. Confirmar

Verificar:
✅ Estado cambia a "Pagado" (verde)
✅ `paid_date` = hoy
✅ `paid_by` = usuario actual
✅ Mueve a sección "Pagos Completados"
```

**4.3 Verificar notificaciones programadas**
```
Nota: Difícil de testear en tiempo real
Verificar en código que se programan 3 notificaciones:
- 3 días antes
- Día del vencimiento
- 1 día después (si vencido)

Verificar manualmente en 3 días si llegan (opcional)
```

---

### DÍA 3: Calendario + Mensajería

#### 5. Calendario 🟡 IMPORTANTE (1-2 horas)

**5.1 Crear evento de custodia**
```
Pasos:
1. Ir a tab "Calendario"
2. Click en una fecha futura
3. Tipo: Custodia
4. Título: "Fin de semana con papá"
5. Fecha inicio: Este viernes
6. Fecha fin: Este domingo
7. Todo el día: Sí
8. Click "Guardar"

Verificar:
✅ Evento aparece en calendario
✅ Color morado (custodia)
✅ Span de 3 días visible
✅ Registro en `calendar_events`
```

**5.2 Crear evento médico con hora**
```
Pasos:
1. Click en fecha
2. Tipo: Médico
3. Título: "Dentista"
4. Fecha: Mañana
5. Todo el día: No
6. Hora: 15:00
7. Click "Guardar"

Verificar:
✅ Evento aparece con hora
✅ Color rojo (médico)
✅ Notificación programada para 1 día antes
```

**5.3 Editar evento**
```
Pasos:
1. Click en evento creado
2. Cambiar título a "Dentista - Control"
3. Click "Guardar"

Verificar:
✅ Cambio reflejado en calendario
✅ `updated_at` actualizado
```

**5.4 Eliminar evento (solo creador)**
```
Pasos:
1. Click en evento que TÚ creaste
2. Click "Eliminar"
3. Confirmar

Verificar:
✅ Evento desaparece del calendario
✅ Eliminado de BD

Intentar eliminar evento de otro usuario:
✅ Botón "Eliminar" NO aparece (RLS)
```

**5.5 Tiempo real (necesitas 2 dispositivos/usuarios)**
```
Pasos:
1. Dispositivo A: Crear evento
2. Dispositivo B: Ver calendario

Verificar:
✅ Evento aparece automáticamente en B (sin refresh)
✅ Supabase Realtime funcionando
```

#### 6. Mensajería 🔴 CRÍTICO (2-3 horas)

**6.1 Enviar mensaje neutral**
```
Pasos:
1. Ir a tab "Mensajes"
2. Escribir: "Hola, ¿cómo está nuestro hijo?"
3. Click "Enviar"

Verificar:
✅ Mensaje se envía inmediatamente
✅ Aparece en chat del remitente
✅ Checkmark (✓) visible
✅ NO hay alert de filtro IA
✅ Registro en tabla `messages`
✅ ai_filtered = false
```

**6.2 Filtro IA: Mensaje hostil 🔴 CRÍTICO**
```
Pasos:
1. Escribir: "Eres un irresponsable, nunca haces nada bien"
2. Click "Enviar"

Verificar:
✅ Alert aparece antes de enviar
✅ Título: "Mensaje detectado como hostil"
✅ Muestra sugerencia de IA más neutral
✅ Opciones: "Usar Sugerencia" / "Forzar Envío" / "Cancelar"

Test opción 1: "Usar Sugerencia"
✅ Mensaje reemplazado por versión neutral
✅ Se envía automáticamente

Test opción 2: "Forzar Envío"
✅ Mensaje original se envía
✅ `ai_filtered` = true
✅ `original_content` guardado

Test opción 3: "Cancelar"
✅ Mensaje NO se envía
✅ Vuelve al input
```

**6.3 Mensajes en tiempo real (2 usuarios)**
```
Setup: Necesitas 2 dispositivos o emuladores

Dispositivo A:
1. Enviar mensaje: "Hola"

Dispositivo B:
Verificar:
✅ Mensaje aparece instantáneamente (sin refresh)
✅ Contador de no leídos aumenta
✅ Badge en tab "Mensajes"

Dispositivo B:
2. Abrir chat

Verificar:
✅ Mensajes marcados como leídos automáticamente
✅ Badge desaparece
✅ Checkmark en A cambia a doble (✓✓)
```

**6.4 Inmutabilidad de mensajes**
```
Pasos:
1. Intentar editar mensaje enviado

Verificar:
✅ NO hay opción de editar
✅ NO hay opción de eliminar
✅ Mensajes permanentes (audit trail)
```

---

### DÍA 4: Cobros Automáticos + Edge Cases

#### 7. Cobros Automáticos 🔴 CRÍTICO (2 horas)

**7.1 Forzar ejecución de cobro mensual**
```
Preparación:
1. Crear 2+ gastos aprobados
2. Asegurar que ambos usuarios tienen tarjetas

Pasos:
1. Usar Postman o curl:

curl -X POST \
  https://TU_PROJECT.supabase.co/functions/v1/monthly-auto-charge \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "x-force-run: true"

Verificar:
✅ Función se ejecuta
✅ Settlement creado en `monthly_settlements`
✅ Cálculo correcto (division 50/50)
✅ Deudor identificado correctamente
✅ Payment Intent creado en Stripe
✅ Transacción registrada en `wallet_transactions`
✅ Webhook recibido (verificar Stripe Dashboard > Developers > Webhooks)
✅ Estado de transacción actualizado
```

**7.2 Webhook de pago exitoso**
```
Stripe Dashboard:
1. Ir a Developers > Webhooks
2. Verificar eventos recibidos
3. Ver `payment_intent.succeeded`

Verificar:
✅ Status de transacción = 'completed'
✅ Settlement status = 'paid'
✅ Notificaciones enviadas a ambos padres (revisar logs)
```

**7.3 Probar cobro fallido (tarjeta declinada)**
```
Preparación:
1. Cambiar tarjeta predeterminada a: 4000 0000 0000 0002
2. Forzar cobro automático

Verificar:
✅ Payment Intent falla
✅ Status transacción = 'failed'
✅ Settlement status = 'pending'
✅ Notificación de error enviada
```

**7.4 Retry de cobros fallidos**
```
Pasos:
1. Dejar pasar 24 horas (o simular con SQL)
2. Forzar ejecución de retry:

curl -X POST \
  https://TU_PROJECT.supabase.co/functions/v1/retry-failed-charges \
  -H "Authorization: Bearer TU_ANON_KEY"

Verificar:
✅ Función encuentra cobros fallidos
✅ Crea nuevo Payment Intent
✅ Reintenta cobro
✅ Si falla 7 veces → status = 'failed' permanente
```

#### 8. Edge Cases y Errores 🟡 IMPORTANTE (2-3 horas)

**8.1 Sin conexión a internet**
```
Pasos:
1. Activar modo avión
2. Intentar crear gasto
3. Intentar enviar mensaje

Verificar:
✅ Error claro: "Sin conexión a internet"
✅ No crash
✅ UI responde
✅ Al reconectar, datos se sincronizan
```

**8.2 Supabase/API caída (simular)**
```
Pasos:
1. En .env cambiar SUPABASE_URL a URL inválida
2. Rebuild app
3. Intentar cargar datos

Verificar:
✅ Loading state
✅ Timeout después de X segundos
✅ Mensaje de error claro
✅ Opción de reintentar
✅ No crash
```

**8.3 Permisos de cámara denegados**
```
Pasos:
1. Ir a configuración del dispositivo
2. Denegar permisos de cámara a SeparApp
3. Intentar escanear boleta

Verificar:
✅ Alert explicativo
✅ Instrucciones para habilitar permisos
✅ Link a configuración (opcional)
✅ Fallback a "Seleccionar de Galería"
```

**8.4 Imagen de boleta muy grande**
```
Pasos:
1. Intentar subir imagen de 10MB+

Verificar:
✅ Compresión automática
✅ Upload exitoso
✅ O error claro si excede límite
```

**8.5 OpenAI API rate limit**
```
Simular:
1. Escanear 10+ boletas seguidas rápidamente

Verificar:
✅ Fallback a entrada manual si falla
✅ No crash
✅ Mensaje claro al usuario
```

---

### DÍA 5: UI/UX + Performance + Multi-dispositivo

#### 9. UI/UX 🟡 IMPORTANTE (2 horas)

**9.1 Pull to refresh en todas las pantallas**
```
Pasos:
1. En cada tab principal (Gastos, Wallet, Calendario, Mensajes, Manutención)
2. Hacer swipe down desde el top

Verificar:
✅ Spinner de loading visible
✅ Datos se refrescan
✅ Animación smooth
```

**9.2 Loading states**
```
Verificar en todas las pantallas:
✅ Spinner/skeleton screen durante carga inicial
✅ Botones muestran "Cargando..." o spinner
✅ No "flash" de contenido vacío
```

**9.3 Empty states**
```
Verificar:
✅ Gastos vacíos: icono + texto + CTA claro
✅ Mensajes vacíos: prompt para enviar primero
✅ Calendario vacío: prompt para crear evento
✅ Wallet vacío: prompt para agregar tarjeta
```

**9.4 Navegación**
```
Pasos:
1. Navegar entre todos los tabs
2. Abrir modales, cerrarlos
3. Usar botón back (Android)

Verificar:
✅ Tabs responden al tap
✅ Modales se abren/cierran correctamente
✅ Back button funciona (Android)
✅ Estado persiste al volver a tab
```

**9.5 Teclado**
```
Pasos:
1. Abrir formulario de crear gasto
2. Tap en input de monto

Verificar:
✅ Teclado numérico se abre
✅ UI ajusta para evitar que teclado tape inputs
✅ Teclado se cierra al hacer tap fuera
✅ Botón "Listo" en teclado funciona (iOS)
```

#### 10. Performance 🟢 NICE TO HAVE (1 hora)

**10.1 Tiempo de carga inicial**
```
Pasos:
1. Abrir app desde cero
2. Medir tiempo hasta que UI principal carga

Objetivo:
✅ < 3 segundos en WiFi
✅ < 5 segundos en 4G
```

**10.2 Scroll performance**
```
Pasos:
1. Lista de 50+ gastos/mensajes
2. Scroll rápido arriba y abajo

Verificar:
✅ Scroll fluido (60fps)
✅ No lag
✅ Imágenes lazy load
```

#### 11. Multi-dispositivo 🟡 IMPORTANTE (2-3 horas)

**11.1 iPhone (iOS)**
```
Dispositivos a probar:
- iPhone 14/15 (pantalla grande)
- iPhone SE (pantalla pequeña)

Verificar:
✅ SafeArea respetada
✅ Notch no tapa contenido
✅ Botones alcanzables
✅ Fuentes legibles
```

**11.2 Android**
```
Dispositivos a probar:
- Pixel 7 (stock Android)
- Samsung Galaxy (Android customizado)

Verificar:
✅ Botón back funciona
✅ Permisos se solicitan correctamente
✅ Notificaciones funcionan
```

**11.3 Tablet (opcional)**
```
Si tienes acceso a iPad:
✅ Layout responsive
✅ No elementos estirados
✅ Landscape mode funciona
```

---

## ✅ CHECKLIST FINAL

Antes de declarar testing completo:

- [ ] **Autenticación**: Login/Logout funcionan perfectamente
- [ ] **Wallet**: Agregar/eliminar tarjetas sin errores
- [ ] **Gastos**: Crear manual + OCR funcionando
- [ ] **OCR**: Auto-detección de monto/fecha/comercio
- [ ] **Manutención**: Crear pagos, marcar como pagados
- [ ] **Calendario**: CRUD de eventos, tiempo real
- [ ] **Mensajería**: Filtro IA detecta hostilidad
- [ ] **Cobros automáticos**: Función ejecuta correctamente
- [ ] **Notificaciones**: Push notifications llegan
- [ ] **Edge cases**: Sin internet, permisos, errores manejados
- [ ] **UI/UX**: Pull to refresh, loading states, empty states
- [ ] **Performance**: App fluida, sin lag
- [ ] **Multi-dispositivo**: iOS + Android tested

---

## 🐛 Registro de Bugs

Al encontrar bugs, documentarlos aquí:

| # | Severidad | Descripción | Pasos para reproducir | Status |
|---|-----------|-------------|----------------------|--------|
| 1 | | | | |
| 2 | | | | |

**Severidades:**
- 🔴 Crítico: Bloqueante, debe arreglarse antes de lanzar
- 🟡 Mayor: Importante pero no bloqueante
- 🟢 Menor: Nice to have, puede esperar

---

## 🎯 Criterios de Éxito

Para considerar testing completo:

1. ✅ **100% de funcionalidades críticas testeadas** (🔴)
2. ✅ **90%+ de funcionalidades importantes testeadas** (🟡)
3. ✅ **0 bugs críticos pendientes**
4. ✅ **< 3 bugs mayores pendientes**
5. ✅ **App probada en al menos 2 dispositivos** (1 iOS + 1 Android)
6. ✅ **Performance aceptable** (< 3s carga inicial)
7. ✅ **UX pulida** (no elementos rotos o mal alineados)

---

**Siguiente paso:** Después de completar testing → [GUIA-DESPLIEGUE.md](./GUIA-DESPLIEGUE.md)
