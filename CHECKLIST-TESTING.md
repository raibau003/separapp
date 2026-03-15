# ✅ Checklist de Testing Pre-Producción

**Última actualización:** 14 de Marzo, 2026
**Requerido para:** Publicación en App Store y Google Play

---

## 🔐 Autenticación y Seguridad

- [ ] **Registro con Google funciona correctamente**
- [ ] **Login con Google funciona correctamente**
- [ ] **Login con Email/Password funciona correctamente**
- [ ] **Logout cierra sesión en ambos sistemas (Firebase + Supabase)**
- [ ] **Sesión persiste después de cerrar/reabrir app**
- [ ] **Usuario sincronizado correctamente en Supabase con `firebase_uid`**
- [ ] **Recuperación de contraseña funciona**
- [ ] **Validación de email fuerte**
- [ ] **Validación de password fuerte (min 8 caracteres)**
- [ ] **Mensajes de error claros en login fallido**

---

## 💰 Stripe y Wallet

- [ ] **Agregar tarjeta de prueba exitosa (4242 4242 4242 4242)**
- [ ] **Tarjeta aparece correctamente en lista de Wallet**
- [ ] **Establecer tarjeta como predeterminada funciona**
- [ ] **Eliminar tarjeta funciona y actualiza UI**
- [ ] **Pago manual funciona (crear gasto → aprobar → cobrar)**
- [ ] **Tarjeta declinada muestra error claro (4000 0000 0000 0002)**
- [ ] **Webhook de Stripe se recibe correctamente**
- [ ] **Transacción aparece en `wallet_transactions` con estado correcto**
- [ ] **Historial de transacciones muestra datos correctos**
- [ ] **Pull to refresh actualiza datos**
- [ ] **Loading states son claros**
- [ ] **Manejo de errores de red**

---

## 🤖 Cobros Automáticos

- [ ] **Forzar ejecución de `monthly-auto-charge` funciona (header `x-force-run: true`)**
- [ ] **Cálculo de diferencias es correcto (división 50/50)**
- [ ] **Settlement creado en `monthly_settlements`**
- [ ] **Cobro ejecutado correctamente con Stripe**
- [ ] **Notificaciones enviadas a ambos padres**
- [ ] **Retry funciona para cobros fallidos (probar con tarjeta declinada)**
- [ ] **Después de 7 días de retry fallido, se marca como failed**
- [ ] **Webhook actualiza estado de settlement correctamente**

---

## 📊 Gastos

- [ ] **Crear gasto manual funciona**
- [ ] **Capturar foto de boleta abre cámara**
- [ ] **OCR con OpenAI Vision API extrae datos correctamente**
- [ ] **Formulario se rellena automáticamente con datos de OCR**
- [ ] **Validación de monto (positivo, formato correcto)**
- [ ] **Validación de fecha (no futuro)**
- [ ] **Aprobar gasto funciona**
- [ ] **Rechazar gasto funciona**
- [ ] **Solo gastos aprobados se incluyen en liquidación**
- [ ] **Imagen de boleta se guarda en Supabase Storage**
- [ ] **Ver imagen de boleta funciona (tap en gasto)**
- [ ] **Filtros de gastos funcionan (mes, estado, categoría)**
- [ ] **Notificaciones de gastos pendientes llegan**

---

## 💵 Manutención

- [ ] **Crear pago de manutención funciona**
- [ ] **Recurrencia mensual funciona (crea próximo pago automáticamente)**
- [ ] **Recurrencia quincenal funciona**
- [ ] **Recurrencia semanal funciona**
- [ ] **Marcar como pagado funciona**
- [ ] **Notificación "3 días antes" llega**
- [ ] **Notificación "día del vencimiento" llega**
- [ ] **Notificación "1 día después (vencido)" llega**
- [ ] **Estadísticas de manutención son correctas**
- [ ] **Pagos vencidos se marcan automáticamente (función `mark_overdue_payments()`)**
- [ ] **Historial de pagos muestra datos correctos**
- [ ] **Pull to refresh actualiza datos**

---

## 📅 Calendario

- [ ] **Calendario se muestra correctamente en español**
- [ ] **Crear evento de custodia funciona**
- [ ] **Crear evento médico funciona**
- [ ] **Crear evento escolar funciona**
- [ ] **Crear evento de actividad funciona**
- [ ] **Evento aparece en calendario con código de color correcto**
- [ ] **Tap en fecha muestra eventos del día**
- [ ] **Editar evento funciona**
- [ ] **Eliminar evento funciona (solo creador puede eliminar)**
- [ ] **Notificación 1 día antes del evento llega**
- [ ] **Eventos all-day no muestran hora**
- [ ] **Eventos con hora muestran hora correcta**
- [ ] **Tiempo real: evento creado por un padre aparece inmediatamente en app del otro**
- [ ] **Pull to refresh actualiza calendario**

---

## 💬 Mensajería

- [ ] **Enviar mensaje neutral funciona (no detecta hostilidad)**
- [ ] **Mensaje aparece en chat del remitente**
- [ ] **Mensaje aparece en tiempo real en chat del receptor**
- [ ] **Filtro de IA detecta mensaje hostil**
- [ ] **Alert con sugerencia aparece cuando mensaje es hostil**
- [ ] **Usar sugerencia de IA funciona**
- [ ] **Forzar envío de mensaje hostil funciona**
- [ ] **Indicador de lectura (✓ / ✓✓) funciona correctamente**
- [ ] **Marcar todos como leídos funciona**
- [ ] **Contador de mensajes no leídos es correcto**
- [ ] **Badge de filtro IA activo se muestra**
- [ ] **Separadores de fecha (Hoy, Ayer, fecha) son correctos**
- [ ] **Scroll automático al recibir mensaje nuevo**
- [ ] **KeyboardAvoidingView funciona en iOS**
- [ ] **Contador de caracteres (máx 500) funciona**
- [ ] **No se puede editar mensaje enviado**
- [ ] **No se puede eliminar mensaje enviado**

---

## 🔔 Notificaciones Push

- [ ] **Permisos de notificaciones se solicitan correctamente**
- [ ] **Push token se registra en `profiles.push_token`**
- [ ] **Notificación de gasto pendiente llega**
- [ ] **Notificación de manutención por vencer llega**
- [ ] **Notificación de evento próximo llega**
- [ ] **Notificación de mensaje nuevo llega**
- [ ] **Notificación de cobro exitoso llega**
- [ ] **Notificación de cobro fallido llega**
- [ ] **Tap en notificación abre la pantalla correcta**
- [ ] **Notificaciones funcionan en background**
- [ ] **Notificaciones funcionan con app cerrada**

---

## 🌐 Edge Cases y Errores

- [ ] **Sin internet: muestra mensaje claro**
- [ ] **Supabase down: maneja error gracefully**
- [ ] **Stripe down: maneja error gracefully**
- [ ] **OpenAI API lenta: muestra loading state**
- [ ] **OpenAI API rate limit: fallback a entrada manual**
- [ ] **Cámara no disponible: muestra error claro**
- [ ] **Permisos de cámara denegados: explica cómo habilitar**
- [ ] **Imagen muy grande: comprime antes de subir**
- [ ] **Usuario sin familia: muestra onboarding**
- [ ] **Usuario con 2+ familias: puede cambiar de familia**
- [ ] **Padre sin método de pago: notifica antes del cobro**
- [ ] **Tarjeta expirada: muestra alerta para actualizar**

---

## 🎨 UI/UX

- [ ] **Todos los botones responden al tap**
- [ ] **Loading states son claros (spinners, skeleton screens)**
- [ ] **Pull to refresh funciona en todas las pantallas**
- [ ] **Mensajes de error son amigables (no técnicos)**
- [ ] **Mensajes de éxito son claros**
- [ ] **Navegación es intuitiva**
- [ ] **Tabs funcionan correctamente**
- [ ] **Modales se cierran correctamente**
- [ ] **Inputs tienen placeholder claro**
- [ ] **Validación en tiempo real (no solo al submit)**
- [ ] **Teclado se oculta correctamente**
- [ ] **SafeArea respetada en iOS**
- [ ] **Android back button funciona correctamente**

---

## 📱 Dispositivos

- [ ] **iPhone 14/15 (iOS 17+)**
- [ ] **iPhone SE (pantalla pequeña)**
- [ ] **iPad (responsive)**
- [ ] **Pixel 7 (Android 13+)**
- [ ] **Samsung Galaxy (Android 12+)**
- [ ] **Dispositivo de gama baja (performance)**

---

## 🔒 Cumplimiento de Políticas

### Apple App Store Review Guidelines
- [ ] **No contenido ofensivo**
- [ ] **Privacidad: política de privacidad visible**
- [ ] **Privacidad: muestra qué datos se recopilan**
- [ ] **Pagos: usa In-App Purchase para contenido digital (N/A, usamos Stripe para servicios)**
- [ ] **Pagos: Stripe permitido para servicios físicos/bienes**
- [ ] **Autenticación: ofrece alternativa a Google Sign-In (sí, Email/Password)**
- [ ] **Metadatos: screenshots, descripción, keywords completos**

### Google Play Store Policies
- [ ] **No contenido ofensivo**
- [ ] **Privacidad: política de privacidad visible**
- [ ] **Permisos: solo solicita permisos necesarios**
- [ ] **Pagos: billing transparente**
- [ ] **Target API Level 33+ (Android 13)**

---

## 🛡️ Seguridad

- [ ] **HTTPS en todas las conexiones**
- [ ] **Secrets no expuestos en código cliente**
- [ ] **RLS habilitado en todas las tablas**
- [ ] **Validación backend de todos los inputs**
- [ ] **Stripe PCI compliance (no guardar datos de tarjeta)**
- [ ] **Firebase Auth JWT verificado**
- [ ] **Rate limiting en Edge Functions**
- [ ] **Sanitización de inputs para prevenir XSS**

---

## ✅ Resultado Esperado

Al completar este checklist:
- ✅ **App funciona sin bugs críticos**
- ✅ **Cumple políticas de Apple y Google**
- ✅ **Segura para usuarios reales**
- ✅ **Lista para enviar a review**

---

**Estado actual:** 0% completado
**Fecha objetivo:** TBD
**Bloqueadores:** FASE 4 al 100% + FASE 5 completa
