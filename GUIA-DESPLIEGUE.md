# 🚀 Guía Completa de Despliegue - SeparApp

**Última actualización:** 14 de Marzo, 2026
**Versión de la app:** 1.0.0
**Plataformas objetivo:** iOS (App Store) + Android (Google Play)

---

## ⚠️ REQUISITOS PREVIOS (CRÍTICO)

Antes de continuar, **DEBES completar**:

1. ✅ **[CHECKLIST-TESTING.md](./CHECKLIST-TESTING.md)** - Todos los items marcados
2. ✅ **FASE 5 al 100%** - Testing y polish completos
3. ✅ **Servicios en producción** - No usar keys de test
4. ✅ **Cuentas de desarrollador**:
   - Apple Developer Program ($99 USD/año)
   - Google Play Console ($25 USD pago único)

---

## 📋 TABLA DE CONTENIDOS

1. [Preparación Inicial](#1-preparación-inicial)
2. [Configurar EAS (Expo Application Services)](#2-configurar-eas-expo-application-services)
3. [Assets y Recursos](#3-assets-y-recursos)
4. [Build para iOS (Apple App Store)](#4-build-para-ios-apple-app-store)
5. [Build para Android (Google Play)](#5-build-para-android-google-play)
6. [Publicación en App Store](#6-publicación-en-app-store)
7. [Publicación en Google Play](#7-publicación-en-google-play)
8. [Post-Lanzamiento](#8-post-lanzamiento)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Preparación Inicial

### 1.1 Crear Cuentas de Desarrollador

#### Apple Developer Program
```
1. Ir a: https://developer.apple.com/programs/
2. Click en "Enroll"
3. Usar Apple ID personal o crear uno nuevo
4. Elegir "Individual" (o "Organization" si tienes empresa)
5. Completar información personal/empresa
6. Pagar $99 USD/año
7. Esperar aprobación (1-2 días)
```

#### Google Play Console
```
1. Ir a: https://play.google.com/console/signup
2. Iniciar sesión con Google Account
3. Completar información del desarrollador
4. Aceptar términos y condiciones
5. Pagar $25 USD (pago único)
6. Verificación puede tomar horas
```

### 1.2 Instalar Expo EAS CLI

```bash
npm install -g eas-cli

# Verificar instalación
eas --version

# Login a tu cuenta Expo
eas login
```

### 1.3 Configurar Proyecto EAS

```bash
cd /Users/javiercorrea/separapp

# Inicializar EAS en el proyecto
eas init

# Crear archivo eas.json
eas build:configure
```

Esto creará `eas.json`. Actualízalo con esta configuración:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://srmhqcjbngrxmhnwfedq.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "sb_publishable_WbaUHBidVdi04zrBPJZ8Ug_AdD6rMNC"
      },
      "ios": {
        "bundleIdentifier": "com.raibau003.separapp"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "tu-email@example.com",
        "ascAppId": "XXXXXXXXXXXX",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./pc-api-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 1.4 Actualizar app.json con Metadata Completo

```json
{
  "expo": {
    "name": "SeparApp",
    "slug": "separapp",
    "owner": "raibau003",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "scheme": "separapp",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#6C63FF"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.raibau003.separapp",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "SeparApp necesita acceso a la cámara para escanear boletas.",
        "NSPhotoLibraryUsageDescription": "SeparApp necesita acceso a tus fotos para adjuntar comprobantes.",
        "NSLocationWhenInUseUsageDescription": "SeparApp usa tu ubicación para agregar contexto a eventos (opcional)."
      }
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#6C63FF",
        "foregroundImage": "./assets/android-icon-foreground.png"
      },
      "package": "com.raibau003.separapp",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "OBTENER_DESPUES_DE_eas_init"
      }
    },
    "plugins": [
      "expo-router",
      ["expo-camera", {"cameraPermission": "SeparApp necesita acceso a la cámara para escanear boletas."}],
      ["expo-image-picker", {"photosPermission": "SeparApp necesita acceso a tus fotos para adjuntar comprobantes."}],
      ["expo-notifications", {"icon": "./assets/notification-icon.png", "color": "#6C63FF"}],
      ["expo-build-properties", {"android": {"minSdkVersion": 21, "targetSdkVersion": 34}}],
      "@react-native-community/datetimepicker"
    ]
  }
}
```

---

## 2. Configurar EAS (Expo Application Services)

### 2.1 Obtener Project ID

```bash
eas init

# Copiar el Project ID que aparece
# Ejemplo: 12345678-1234-1234-1234-123456789012
```

Actualizar `app.json`:

```json
"extra": {
  "eas": {
    "projectId": "PEGAR_PROJECT_ID_AQUI"
  }
}
```

### 2.2 Configurar Secrets (Variables de Entorno)

EAS puede manejar secrets de forma segura:

```bash
# Agregar secrets de producción
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value pk_live_XXXXXX
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value sk-proj-XXXXXX
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value XXXXXX.apps.googleusercontent.com

# Listar secrets
eas secret:list
```

**IMPORTANTE:** Usa keys de **PRODUCCIÓN**, NO de test.

---

## 3. Assets y Recursos

### 3.1 Iconos Requeridos

Necesitas generar iconos en diferentes tamaños. Usa https://www.appicon.co/ o Figma.

**iOS:**
- `icon.png` - 1024x1024px (sin transparencia)

**Android:**
- `android-icon-foreground.png` - 1024x1024px (con transparencia)
- `android-icon-background.png` - 1024x1024px (fondo sólido #6C63FF)
- `android-icon-monochrome.png` - 1024x1024px (monocromático para Android 13+)

**Otros:**
- `splash-icon.png` - 1242x2436px
- `notification-icon.png` - 96x96px (Android, monocromático)
- `favicon.png` - 48x48px

### 3.2 Screenshots para las Tiendas

**iOS (App Store Connect):**
- iPhone 6.7" (iPhone 14 Pro Max): 1290 x 2796 px
- iPhone 6.5" (iPhone 11 Pro Max): 1242 x 2688 px
- iPad Pro 12.9": 2048 x 2732 px

Mínimo **3 screenshots**, máximo **10**.

**Android (Google Play Console):**
- Phone: 1080 x 1920 px (mínimo)
- Tablet: 1920 x 1080 px (opcional)

Mínimo **2 screenshots**, máximo **8**.

**Herramienta recomendada:** Figma con frames de dispositivos.

### 3.3 Feature Graphic (Android)

Google Play requiere un "Feature Graphic":
- Tamaño: 1024 x 500 px
- Formato: PNG o JPEG
- Contenido: Banner promocional de la app

---

## 4. Build para iOS (Apple App Store)

### 4.1 Generar Certificados y Provisioning Profiles

EAS puede manejar esto automáticamente:

```bash
# Build de producción para iOS
eas build --platform ios --profile production

# EAS preguntará:
# "Would you like to automatically create your iOS credentials?"
# → Responde: Yes
```

EAS generará automáticamente:
- **Distribution Certificate** (p12)
- **Provisioning Profile** (mobileprovision)
- **Push Notification Key** (p8)

Estos se guardan en tu cuenta de Expo y Apple Developer.

### 4.2 Build Manual (Alternativa)

Si prefieres control manual:

```bash
# Generar certificados manualmente
eas credentials

# Seleccionar:
# 1. iOS
# 2. Production
# 3. Build credentials (Distribution Certificate)
```

### 4.3 Ejecutar Build

```bash
# Build de producción
eas build --platform ios --profile production

# Esperar 10-20 minutos
# Al terminar, obtendrás un enlace para descargar el .ipa
```

### 4.4 Verificar Build Localmente (Opcional)

```bash
# Descargar el .ipa
eas build:list

# Probar en simulador (solo para preview builds)
eas build --platform ios --profile preview
```

---

## 5. Build para Android (Google Play)

### 5.1 Generar Keystore

EAS puede generar la keystore automáticamente:

```bash
# Build de producción para Android
eas build --platform android --profile production

# EAS preguntará:
# "Would you like to automatically create your Android credentials?"
# → Responde: Yes
```

EAS generará:
- **Keystore** (jks)
- **Key Alias**
- **Passwords**

**CRÍTICO:** Guarda las credenciales. Si las pierdes, NO podrás actualizar la app nunca más.

### 5.2 Build Manual (Alternativa)

```bash
# Generar keystore manualmente
keytool -genkeypair -v -storetype PKCS12 -keystore separapp.keystore -alias separapp -keyalg RSA -keysize 2048 -validity 10000

# Configurar en EAS
eas credentials
```

### 5.3 Ejecutar Build

```bash
# Build APK (para testing)
eas build --platform android --profile production

# Build AAB (para Google Play - RECOMENDADO)
# Actualizar eas.json primero:
# "production": { "android": { "buildType": "app-bundle" } }
eas build --platform android --profile production

# Esperar 10-15 minutos
# Al terminar, obtendrás enlace para descargar .aab o .apk
```

### 5.4 Probar APK Localmente

```bash
# Descargar el APK
eas build:list

# Instalar en dispositivo Android conectado
adb install separapp.apk
```

---

## 6. Publicación en App Store

### 6.1 Crear App en App Store Connect

```
1. Ir a: https://appstoreconnect.apple.com
2. Login con Apple ID de desarrollador
3. Click en "My Apps" → "+" → "New App"
4. Completar información:
   - Platform: iOS
   - Name: SeparApp
   - Primary Language: Spanish (Spain) o Spanish (Latin America)
   - Bundle ID: com.raibau003.separapp (debe coincidir con app.json)
   - SKU: separapp (identificador único interno)
5. Click "Create"
```

### 6.2 Completar Metadata

En App Store Connect, ve a tu app → "App Information":

**General Information:**
- **Name:** SeparApp
- **Subtitle:** Gestión inteligente para padres separados
- **Category:** Lifestyle o Productivity
- **Secondary Category (opcional):** Finance

**Privacy:**
- **Privacy Policy URL:** (debes crear una página web con política de privacidad)
- **Data Collection:** Declarar qué datos recopilas (ver sección 6.3)

### 6.3 Declarar Recopilación de Datos

Apple requiere declarar qué datos recopilas:

**Datos que SeparApp recopila:**
- ✅ Email
- ✅ Nombre completo
- ✅ Información financiera (tarjetas via Stripe - tokenizado)
- ✅ Mensajes
- ✅ Fotos (boletas)
- ✅ Información de ubicación (opcional, si implementaste en calendario)

**Uso de datos:**
- App functionality
- Product personalization
- Analytics

**Third-party sharing:**
- ✅ Stripe (pagos)
- ✅ Supabase (backend)
- ✅ OpenAI (OCR y moderación)
- ✅ Firebase (autenticación)

### 6.4 Screenshots y Previews

En "App Store" tab:

1. **Screenshots:**
   - Subir mínimo 3 screenshots por tamaño de dispositivo
   - Usar capturas de: Dashboard, Gastos, Wallet, Calendario, Mensajería

2. **App Previews (opcional):**
   - Videos de hasta 30 segundos
   - Mostrar flujo de uso principal

### 6.5 Descripción y Keywords

**Description (español):**
```
SeparApp simplifica la coparentalidad entre padres separados con herramientas inteligentes para gestionar gastos, pagos, calendario compartido y comunicación efectiva.

CARACTERÍSTICAS PRINCIPALES:

💰 GASTOS COMPARTIDOS
• Escanea boletas automáticamente con OCR inteligente
• Aprobación dual de gastos
• División automática 50/50
• Historial completo de transacciones

💳 PAGOS AUTOMATIZADOS
• Integración con Stripe para cobros seguros
• Liquidaciones mensuales automáticas
• Recordatorios de manutención
• Historial de pagos completo

📅 CALENDARIO COMPARTIDO
• Eventos de custodia, médicos, escolares y actividades
• Código de colores por tipo de evento
• Notificaciones automáticas
• Sincronización en tiempo real

💬 MENSAJERÍA MODERADA
• Chat en tiempo real
• Filtro de IA para comunicación respetuosa
• Mensajes inmutables (no editables)
• Indicadores de lectura

🔐 SEGURIDAD Y PRIVACIDAD
• Autenticación con Google o Email
• Encriptación de extremo a extremo
• Cumplimiento PCI-DSS para pagos
• Control total de tus datos

SeparApp está diseñada para hacer la coparentalidad más simple, organizada y libre de conflictos.
```

**Keywords:**
```
coparentalidad,padres separados,gastos compartidos,calendario familiar,manutención,pagos,divorcio,custodia,comunicación,mediación
```

### 6.6 Información de Revisión

En "App Review Information":

**Contact Information:**
- First Name: [Tu nombre]
- Last Name: [Tu apellido]
- Phone Number: +56 9 XXXX XXXX
- Email: support@separapp.com (o tu email)

**Sign-In Information:**
- Username: (crear cuenta de prueba)
- Password: (password de prueba)
- **IMPORTANTE:** Apple revisará tu app. Debes proveer credenciales de prueba funcionales.

**Notes:**
```
Cuenta de prueba provista para testing.
La app requiere dos usuarios (padres separados) para probar todas las funcionalidades.

Usuario 1: test1@separapp.com / TestPass123
Usuario 2: test2@separapp.com / TestPass123

Estos usuarios ya están vinculados en una familia de prueba.

Para probar pagos, usar tarjeta de prueba Stripe:
4242 4242 4242 4242, CVV: 123, Exp: 12/34
```

### 6.7 Subir Build

```bash
# Subir build a App Store Connect
eas submit --platform ios --latest

# O subir manualmente desde web:
# 1. Ir a App Store Connect
# 2. Tu app → TestFlight → "+" → Seleccionar build
```

### 6.8 Configurar Release

En "App Store" tab:

1. **Version:** 1.0.0
2. **What's New in This Version:**
   ```
   🎉 Lanzamiento inicial de SeparApp

   • Gestión completa de gastos compartidos con OCR
   • Pagos automáticos con Stripe
   • Calendario compartido
   • Mensajería con filtro de IA
   • Recordatorios de manutención
   ```
3. **Release:** Manual release (para controlar cuándo se publica)

### 6.9 Enviar a Revisión

```
1. Click en "Add for Review"
2. Seleccionar build subido
3. Responder cuestionarios de export compliance:
   - "Does your app use encryption?" → No (o Yes si implementaste E2EE custom)
4. Click en "Submit for Review"
```

**Tiempo de revisión:** 1-3 días hábiles

---

## 7. Publicación en Google Play

### 7.1 Crear App en Google Play Console

```
1. Ir a: https://play.google.com/console
2. Click en "Create app"
3. Completar información:
   - App name: SeparApp
   - Default language: Spanish (Spain) o Spanish (Latin America)
   - App or game: App
   - Free or paid: Free (con compras in-app si implementas subscripciones)
4. Declaraciones:
   - ✅ Developer Program Policies
   - ✅ US export laws
5. Click "Create app"
```

### 7.2 Configurar Store Listing

En "Main store listing":

**App details:**
- **App name:** SeparApp
- **Short description (80 chars):**
  ```
  Gestión inteligente para padres separados: gastos, pagos, calendario y chat.
  ```
- **Full description (4000 chars):**
  ```
  SeparApp es la solución completa para padres separados que buscan simplificar la coparentalidad con herramientas inteligentes y automatizadas.

  💰 GESTIÓN DE GASTOS COMPARTIDOS
  • Escanea boletas automáticamente con tecnología OCR
  • Aprobación dual de gastos
  • División automática 50/50
  • Historial completo de transacciones
  • Exporta reportes en PDF

  💳 SISTEMA DE PAGOS AUTOMATIZADOS
  • Integración segura con Stripe
  • Liquidaciones mensuales automáticas
  • Recordatorios de manutención
  • Cobros automáticos programables
  • Historial de pagos y recibos

  📅 CALENDARIO COMPARTIDO
  • Eventos de custodia, médicos, escolares y actividades
  • Código de colores por tipo de evento
  • Notificaciones automáticas 1 día antes
  • Sincronización en tiempo real entre padres
  • Vista mensual y semanal

  💬 MENSAJERÍA INTELIGENTE
  • Chat en tiempo real
  • Filtro de IA para mantener comunicación respetuosa
  • Mensajes inmutables (no editables ni eliminables)
  • Indicadores de lectura
  • Sugerencias de reformulación por IA

  🔐 SEGURIDAD Y PRIVACIDAD
  • Autenticación dual: Google o Email/Password
  • Encriptación de datos
  • Cumplimiento PCI-DSS para pagos
  • Row Level Security en base de datos
  • Control total de tus datos personales

  🎯 PARA QUIÉN ES SEPARAPP
  • Padres separados o divorciados
  • Co-padres que buscan organización
  • Familias con acuerdos de custodia compartida
  • Cualquier persona que necesite gestionar gastos compartidos

  SeparApp hace la coparentalidad más simple, organizada y libre de conflictos. Descárgala hoy y transforma la forma en que te comunicas y organizas con tu co-padre/madre.
  ```

**Graphics:**
- **Icon:** 512 x 512 px (PNG con transparencia)
- **Feature Graphic:** 1024 x 500 px (PNG o JPEG)
- **Phone screenshots:** Mínimo 2, máximo 8 (1080 x 1920 px)
- **Tablet screenshots (opcional):** 7-inch y 10-inch

**Categorization:**
- **App category:** Lifestyle o Parenting
- **Tags:** family, parenting, finance, productivity

**Contact details:**
- **Email:** support@separapp.com
- **Phone (opcional):** +56 9 XXXX XXXX
- **Website (opcional):** https://separapp.com

**Privacy Policy:**
- URL: (crear página con política de privacidad)

### 7.3 Configurar Data Safety

En "Data safety":

**Declarar datos recopilados:**

1. **Location:**
   - [ ] Approximate location (si implementaste ubicación)
   - [ ] Precise location

2. **Personal info:**
   - ✅ Name
   - ✅ Email address
   - ✅ User IDs

3. **Financial info:**
   - ✅ Payment info (via Stripe, tokenizado)
   - ✅ Purchase history

4. **Messages:**
   - ✅ Emails or text messages

5. **Photos and videos:**
   - ✅ Photos (boletas)

6. **Files and docs:**
   - ✅ Files and docs (receipts)

**Data usage:**
- App functionality: ✅
- Analytics: ✅
- Fraud prevention: ✅

**Data sharing:**
- Stripe (payment processing)
- Supabase (backend services)
- OpenAI (OCR and moderation)
- Firebase (authentication)

### 7.4 Configurar App Content

**Age rating:**
- Responder cuestionario:
  - Violence: None
  - Sexual content: None
  - Profanity: None
  - User interaction: Yes (chat)
  - Shares location: No (o Yes si implementaste)
  - Digital purchases: Yes (Stripe)

**Target audience:**
- Primary: Ages 18 and over
- Secondary: None

**News app:** No

**COVID-19 contact tracing/status:** No

**Data safety:** (completar cuestionario basado en 7.3)

**Government apps:** No

**Financial features:** Yes
- Tipo: Payment services

**Ads:** No (a menos que implementes ads)

### 7.5 Subir APK/AAB

En "Release" → "Production" → "Create new release":

```bash
# Opción 1: Subir desde CLI
eas submit --platform android --latest

# Opción 2: Subir manualmente
# 1. Descargar .aab desde EAS
eas build:list

# 2. En Google Play Console:
# Release → Production → Create new release → Upload
```

**Release name:** 1.0.0

**Release notes (español):**
```
🎉 Lanzamiento inicial de SeparApp

• Gestión completa de gastos compartidos con OCR inteligente
• Sistema de pagos automáticos con Stripe
• Calendario compartido con notificaciones
• Chat en tiempo real con filtro de IA
• Recordatorios de manutención
• Autenticación con Google o Email
```

### 7.6 Configurar Internal Testing (Recomendado)

Antes de publicar en producción, publica en "Internal testing":

```
1. En "Release" → "Internal testing" → "Create new release"
2. Subir AAB
3. Agregar testers (emails)
4. Save → Review release → Start rollout to Internal testing
```

Testers recibirán enlace para descargar y probar.

### 7.7 Enviar a Revisión

```
1. Completar todos los tabs (verde checkmark)
2. En "Release" → "Production" → "Create new release"
3. Upload AAB
4. Click "Review release"
5. Verificar que todo esté correcto
6. Click "Start rollout to Production"
```

**Tiempo de revisión:** Unas horas a 2 días

---

## 8. Post-Lanzamiento

### 8.1 Monitoreo

**App Store Connect:**
- Sales and Trends → Descargas diarias
- App Analytics → Uso, crashes, engagement
- Ratings and Reviews → Responder a usuarios

**Google Play Console:**
- Statistics → Instalaciones, desinstalaciones
- Vitals → Crashes, ANRs (App Not Responding)
- Reviews → Responder a usuarios

### 8.2 Responder a Reviews

Ambas plataformas permiten responder a reviews. Best practices:
- Responde en 24-48 horas
- Sé profesional y empático
- Ofrece soluciones a problemas reportados
- Agradece feedback positivo

### 8.3 Actualizaciones

Cuando tengas una nueva versión (ej: 1.0.1):

**Actualizar versión:**

```json
// app.json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

**Build y submit:**

```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios --latest

# Android
eas build --platform android --profile production
eas submit --platform android --latest
```

### 8.4 Analítica

Considera integrar:
- **Firebase Analytics** (gratis)
- **Mixpanel** (freemium)
- **Amplitude** (freemium)

```bash
npm install @react-native-firebase/analytics

# Uso:
import analytics from '@react-native-firebase/analytics';

analytics().logEvent('gasto_creado', { amount: 5000 });
```

### 8.5 Crash Reporting

Integrar Sentry para reportar crashes:

```bash
npx expo install @sentry/react-native

# Configurar en app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://XXXXX@sentry.io/XXXXX',
  enableInExpoDevelopment: false,
  debug: false,
});
```

---

## 9. Troubleshooting

### iOS: "Missing Compliance" en App Store Connect

**Problema:** Build aparece con warning "Missing Compliance"

**Solución:**
```json
// app.json
{
  "expo": {
    "ios": {
      "config": {
        "usesNonExemptEncryption": false
      }
    }
  }
}
```

### iOS: Build rechazado por "Missing Purpose Strings"

**Problema:** Apple rechaza por falta de descripciones de permisos

**Solución:** Agregar en `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "SeparApp necesita acceso a la cámara para escanear boletas.",
        "NSPhotoLibraryUsageDescription": "SeparApp necesita acceso a tus fotos para adjuntar comprobantes."
      }
    }
  }
}
```

### Android: "App not installed" al intentar instalar APK

**Problema:** APK no se instala en dispositivo

**Solución:**
- Verificar que no haya versión anterior instalada (desinstalar primero)
- Habilitar "Install from unknown sources" en Settings
- Verificar firma del APK (debe estar firmado con tu keystore)

### Build falla con "Gradle build failed"

**Problema:** Build de Android falla

**Solución:**
```bash
# Limpiar caché de Expo
eas build:clear-cache

# Rebuild
eas build --platform android --profile production --clear-cache
```

### Stripe no funciona en producción

**Problema:** Pagos fallan en app publicada

**Solución:**
- Verificar que estés usando `STRIPE_PUBLISHABLE_KEY` de producción (pk_live_...)
- Verificar que Stripe webhook apunte a URL de producción
- Revisar Stripe Dashboard → Developers → Logs

### Notificaciones push no llegan

**Problema:** Usuarios no reciben notificaciones

**Solución iOS:**
- Verificar que Distribution Profile incluya Push Notifications capability
- Regenerar certificado de push con `eas credentials`

**Solución Android:**
- Verificar que google-services.json esté configurado correctamente
- Verificar permisos de notificaciones en app.json

### App rechazada por "Performance - App Completeness"

**Problema:** Apple rechaza por app incompleta o con bugs

**Solución:**
- Completar [CHECKLIST-TESTING.md](./CHECKLIST-TESTING.md) al 100%
- Proveer cuenta de prueba funcional con datos de ejemplo
- Agregar notas detalladas en "App Review Information"

---

## 📞 Recursos Adicionales

**Documentación:**
- Expo EAS: https://docs.expo.dev/eas/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policy: https://play.google.com/about/developer-content-policy/

**Comunidad:**
- Expo Discord: https://chat.expo.dev
- Stack Overflow: Tag `expo` y `eas`

**Soporte:**
- Expo Support: https://expo.dev/support
- Apple Developer Support: https://developer.apple.com/support/
- Google Play Support: https://support.google.com/googleplay/android-developer/

---

## ✅ Checklist Final de Despliegue

Antes de enviar a revisión:

- [ ] **[CHECKLIST-TESTING.md](./CHECKLIST-TESTING.md) completo al 100%**
- [ ] **FASE 5 terminada**
- [ ] **Cuentas de desarrollador activas (Apple + Google)**
- [ ] **EAS configurado con Project ID**
- [ ] **Secrets de producción configurados en EAS**
- [ ] **app.json actualizado con metadata completo**
- [ ] **Assets creados (iconos, screenshots, feature graphic)**
- [ ] **Política de privacidad publicada en web**
- [ ] **Cuentas de prueba creadas para reviewers**
- [ ] **Builds generados exitosamente (iOS + Android)**
- [ ] **Metadata completo en App Store Connect y Google Play Console**
- [ ] **Data Safety / Privacy declarado correctamente**
- [ ] **Enviado a revisión en ambas plataformas**

---

**¡Buena suerte con el lanzamiento de SeparApp! 🚀**
