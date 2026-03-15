# ⚡️ Comandos Rápidos de Despliegue - SeparApp

**Referencia rápida para el proceso de build y publicación**

---

## 🔧 Instalación y Setup Inicial

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Verificar instalación
eas --version

# Login a Expo
eas login

# Inicializar EAS en el proyecto
cd /Users/javiercorrea/separapp
eas init

# Crear configuración de build
eas build:configure
```

---

## 🔑 Gestión de Secrets

```bash
# Listar secrets existentes
eas secret:list

# Crear secret
eas secret:create --scope project --name NOMBRE_SECRET --value valor

# Eliminar secret
eas secret:delete --scope project --name NOMBRE_SECRET

# Secrets requeridos para producción:
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value pk_live_XXXXXX
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value sk-proj-XXXXXX
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value XXXXXX.apps.googleusercontent.com
```

---

## 🍎 iOS - Build y Submit

```bash
# Build de desarrollo (simulator)
eas build --platform ios --profile preview

# Build de producción
eas build --platform ios --profile production

# Listar builds
eas build:list

# Ver detalles de un build
eas build:view [BUILD_ID]

# Submit a App Store Connect (automático)
eas submit --platform ios --latest

# Submit con build específico
eas submit --platform ios --id [BUILD_ID]

# Gestionar credenciales manualmente
eas credentials
```

---

## 🤖 Android - Build y Submit

```bash
# Build APK (para testing local)
eas build --platform android --profile production

# Build AAB (para Google Play - RECOMENDADO)
# Primero actualizar eas.json:
# "production": { "android": { "buildType": "app-bundle" } }
eas build --platform android --profile production

# Listar builds
eas build:list

# Submit a Google Play (automático)
eas submit --platform android --latest

# Submit con build específico
eas submit --platform android --id [BUILD_ID]

# Gestionar credenciales manualmente
eas credentials

# Instalar APK en dispositivo conectado
adb install separapp.apk
```

---

## 🚀 Build para Ambas Plataformas

```bash
# Build iOS + Android simultáneamente
eas build --platform all --profile production

# Submit ambas plataformas
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## 🧹 Limpieza y Troubleshooting

```bash
# Limpiar caché de build
eas build:clear-cache

# Rebuild con caché limpio
eas build --platform ios --profile production --clear-cache
eas build --platform android --profile production --clear-cache

# Ver logs de build en tiempo real
eas build:view [BUILD_ID]

# Cancelar build en progreso
eas build:cancel [BUILD_ID]

# Inspeccionar credenciales
eas credentials

# Eliminar credenciales (regenerar)
eas credentials
# Seleccionar platform → Remove credentials
```

---

## 📦 Gestión de Versiones

```bash
# Antes de cada build, actualizar en app.json:
# - version: "1.0.1"
# - ios.buildNumber: "2"
# - android.versionCode: 2

# Ejemplo de flujo completo:
# 1. Editar app.json (aumentar versiones)
# 2. Commit cambios
git add app.json
git commit -m "Bump version to 1.0.1"
git push

# 3. Build
eas build --platform all --profile production

# 4. Submit
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## 🔍 Información y Debugging

```bash
# Ver información del proyecto
eas project:info

# Ver configuración actual
eas config

# Ver builds recientes
eas build:list --limit 10

# Ver builds por plataforma
eas build:list --platform ios
eas build:list --platform android

# Ver builds por estado
eas build:list --status finished
eas build:list --status in-progress
eas build:list --status errored

# Descargar build
eas build:download [BUILD_ID]
```

---

## 🧪 Testing y Preview

```bash
# Build de desarrollo con dev-client
eas build --platform ios --profile development
eas build --platform android --profile development

# Build de preview (internal testing)
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Instalar en dispositivo (Android)
eas build --platform android --profile preview
# Descargar APK y:
adb install separapp.apk

# Instalar en dispositivo (iOS)
eas build --platform ios --profile preview
# Descargar y usar Apple Configurator 2 o Xcode Devices
```

---

## 📱 Gestión de Dispositivos (iOS)

```bash
# Registrar dispositivo para testing
eas device:create

# Listar dispositivos registrados
eas device:list

# Ver dispositivos y sus UDIDs
eas device:view [DEVICE_ID]
```

---

## 🔐 Credenciales - iOS

```bash
# Ver/gestionar credenciales de iOS
eas credentials

# Opciones disponibles:
# 1. Distribution Certificate
# 2. Push Notification Key
# 3. Provisioning Profile

# Regenerar certificado de distribución
eas credentials
# → iOS → Production → Distribution Certificate → Remove → Generate new

# Regenerar push key
eas credentials
# → iOS → Production → Push Notification Key → Remove → Generate new

# Regenerar provisioning profile
eas credentials
# → iOS → Production → Provisioning Profile → Remove → Generate new
```

---

## 🔐 Credenciales - Android

```bash
# Ver/gestionar credenciales de Android
eas credentials

# Ver keystore actual
eas credentials
# → Android → Production → Build credentials → View

# IMPORTANTE: Backup de keystore
eas credentials
# → Android → Production → Build credentials → Download
# Guardar .jks en lugar seguro (1Password, etc.)

# Regenerar keystore (SOLO SI PERDISTE EL ORIGINAL Y ES NUEVA APP)
eas credentials
# → Android → Production → Build credentials → Remove → Generate new
```

---

## 🌐 Webhook y Configuración Stripe

```bash
# Configurar webhook de Stripe para producción
# URL: https://srmhqcjbngrxmhnwfedq.supabase.co/functions/v1/stripe-webhook

# Testing local de webhook:
stripe listen --forward-to https://srmhqcjbngrxmhnwfedq.supabase.co/functions/v1/stripe-webhook

# Ver eventos de webhook en Stripe
stripe events list --limit 10
```

---

## 📊 Analítica y Monitoreo

```bash
# Ver crashes en Sentry (si lo configuraste)
# Dashboard: https://sentry.io/organizations/[ORG]/projects/[PROJECT]/

# Ver analítica en Firebase (si lo configuraste)
# Console: https://console.firebase.google.com/project/separapp/analytics

# Logs de Supabase Edge Functions
# Dashboard: https://supabase.com/dashboard/project/[PROJECT]/functions
```

---

## 🔄 Flujo Completo de Actualización

```bash
# Paso 1: Hacer cambios en código
# ...

# Paso 2: Actualizar versión en app.json
# version: "1.0.1" → "1.0.2"
# ios.buildNumber: "2" → "3"
# android.versionCode: 2 → 3

# Paso 3: Commit
git add .
git commit -m "Update: [descripción de cambios]"
git push

# Paso 4: Build producción
eas build --platform all --profile production

# Paso 5: Esperar builds (10-20 min)
eas build:list

# Paso 6: Submit a tiendas
eas submit --platform ios --latest
eas submit --platform android --latest

# Paso 7: Actualizar metadata en tiendas (si es necesario)
# App Store Connect: What's New in This Version
# Google Play Console: Release notes

# Paso 8: Monitorear rollout
# App Store Connect → TestFlight → External Testing → Phased Release
# Google Play Console → Release → Production → Manage rollout
```

---

## ⚠️ Comandos de Emergencia

```bash
# Cancelar build en progreso
eas build:cancel [BUILD_ID]

# Revertir a versión anterior en producción
# App Store: En App Store Connect → Versions → Remove from Sale
# Google Play: En Google Play Console → Release → Production → Halt rollout

# Limpiar TODO y empezar de cero (CUIDADO)
eas build:clear-cache
eas credentials
# → Eliminar todas las credenciales
eas init
```

---

## 🆘 Troubleshooting Común

```bash
# Error: "Build failed with error: Gradle build failed"
eas build:clear-cache
eas build --platform android --profile production --clear-cache

# Error: "Missing credentials"
eas credentials
# → Regenerar credenciales faltantes

# Error: "Unable to find Apple Developer Team"
eas credentials
# → iOS → Add Team

# Error: "Provisioning profile doesn't include signing certificate"
eas credentials
# → iOS → Production → Provisioning Profile → Remove → Generate new

# Error: "APK not signed"
eas credentials
# → Android → Production → Build credentials → Verify keystore exists

# Ver logs detallados de build
eas build:view [BUILD_ID]
# Scroll para ver errores completos
```

---

## 📝 Notas Importantes

1. **NUNCA eliminar keystore de Android** - Si lo pierdes, no podrás actualizar la app nunca más
2. **Backup de credenciales** - Guardar en lugar seguro (1Password, Bitwarden, etc.)
3. **Testing antes de producción** - Siempre probar en Internal Testing primero
4. **Versiones incrementales** - Aumentar versionCode/buildNumber en cada build
5. **Secrets de producción** - Verificar que no uses keys de test/desarrollo

---

## 🔗 Enlaces Rápidos

- **EAS Dashboard:** https://expo.dev/accounts/raibau003/projects/separapp
- **App Store Connect:** https://appstoreconnect.apple.com
- **Google Play Console:** https://play.google.com/console
- **Supabase Dashboard:** https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Firebase Console:** https://console.firebase.google.com/project/separapp

---

**Última actualización:** 14 de Marzo, 2026
