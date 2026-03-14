# 🎨 Rebranding: Órbita → SeparApp

**Fecha:** 14 de Marzo, 2026
**Commit:** 2a78cd8

---

## Cambios Realizados

### ✅ Configuración de la App

**app.json:**
- `name`: "Órbita" → **"SeparApp"**
- `slug`: "orbita-app" → **"separapp"**
- `scheme`: "orbita" → **"separapp"**
- `bundleIdentifier` (iOS): "com.raibau003.orbita" → **"com.raibau003.separapp"**
- `package` (Android): "com.raibau003.orbita" → **"com.raibau003.separapp"**
- Mensajes de permisos actualizados con "SeparApp"

**package.json:**
- `name`: "orbita-app" → **"separapp"**

---

### ✅ Estructura del Proyecto

**Directorio:**
```
/Users/javiercorrea/orbita-app → /Users/javiercorrea/separapp
```

---

### ✅ Documentación

Todos los archivos `.md` actualizados:
- README.md
- CLAUDE.md
- LEER-ESTO-PRIMERO.md
- PROGRESO.md
- IMPLEMENTACION-COMPLETA.md
- RESUMEN-SESION-HOY.md
- SETUP-COMPLETO.md
- SUPABASE-SETUP.md

**Cambios en documentación:**
- "Órbita App" → "SeparApp"
- "orbita-app" → "separapp"
- Referencias de bundle identifiers actualizadas

---

### ✅ Plan de Implementación

**Archivo:** `/Users/javiercorrea/.claude/plans/polymorphic-launching-valley.md`
- Todas las referencias actualizadas a SeparApp

---

## 🚨 Acciones Pendientes (Firebase/Stores)

Cuando configures Firebase y publiques en stores, recuerda usar:

### Firebase Console
```
Proyecto: separapp
Bundle ID (iOS): com.raibau003.separapp
Package Name (Android): com.raibau003.separapp
```

### Apple App Store
```
App Name: SeparApp
Bundle Identifier: com.raibau003.separapp
```

### Google Play Store
```
App Name: SeparApp
Package Name: com.raibau003.separapp
```

### Stripe Dashboard
```
Business Name: SeparApp
Description: Plataforma de coparentalidad para padres separados
```

### Expo/EAS
```
Slug: separapp
Owner: raibau003
```

---

## 📝 Significado del Nombre

**SeparApp** = **Separ**ados + **App**

- Directo y claro
- Fácil de recordar
- Describe perfectamente el propósito de la app
- Fácil de buscar en stores
- Corto y memorable

---

## 🎯 Identidad de Marca

**Tagline:** "Gestión inteligente para padres separados"

**Propuesta de Valor:**
- Facilita la coparentalidad
- Transparencia en gastos
- Comunicación respetuosa
- Automatización de pagos
- Todo en un solo lugar

**Color Principal:** #6C63FF (Violeta)

---

## ✅ Verificación

Comando para verificar que no queden referencias a "Órbita":

```bash
cd ~/separapp
grep -r "Órbita\|orbita-app" --exclude-dir=node_modules --exclude-dir=.git . | grep -v "REBRANDING.md"
```

Si no aparece nada, ¡el rebranding está completo! ✨

---

**Estado:** ✅ Rebranding completado
**Próximo paso:** Continuar con implementación del plan completo
