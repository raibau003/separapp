# 🚀 Inicio Rápido - Testing SeparApp

**Fecha:** 14 de Marzo, 2026

---

## ✅ El servidor de desarrollo está corriendo

Ya ejecuté: `npx expo start --clear`

---

## 📱 Opciones para Testear

### Opción 1: iOS (Si tienes Mac con Xcode)
```bash
# En otra terminal:
npm run ios
```

### Opción 2: Android
```bash
# En otra terminal:
npm run android
```

### Opción 3: Expo Go en dispositivo físico
1. Descargar **Expo Go** de App Store o Google Play
2. Escanear QR code que aparece en la terminal
3. App se carga en tu dispositivo

---

## 📋 Checklist de Testing DÍA 1

Abre el archivo **[TEST-RESULTS.md](./TEST-RESULTS.md)** y ve marcando cada item conforme lo pruebes.

### Orden sugerido:

#### 1️⃣ Verificar que app inicia (5 min)
- ✅ App se abre sin crashes
- ✅ Pantalla de login visible
- ✅ No hay errores rojos en terminal

#### 2️⃣ Autenticación (30 min)
**Test 1.1: Registro**
1. Click "Crear cuenta"
2. Email: `test1@separapp.com`
3. Password: `TestPass123!`
4. Registrarse

**Test 1.2: Login**
1. Logout
2. Login con mismo email/password

**Test 1.4: Persistencia**
1. Cerrar app completamente
2. Reabrir
3. ¿Sigue logueado?

#### 3️⃣ Wallet & Stripe (45 min)
**Test 2.1: Agregar tarjeta exitosa**
1. Ir a tab "Wallet"
2. Click "Agregar Tarjeta"
3. Usar: `4242 4242 4242 4242`, `12/34`, `123`
4. Marcar como predeterminada
5. Guardar

**Test 2.2: Agregar segunda tarjeta**
1. Agregar: `5555 5555 5555 4444`, `12/34`, `123`
2. NO marcar como predeterminada

**Test 2.4: Eliminar tarjeta**
1. Eliminar primera tarjeta (Visa)

**Test 2.5: Tarjeta declinada**
1. Intentar agregar: `4000 0000 0000 0002`
2. ¿Muestra error claro?

---

## 🐛 Si Encuentras Bugs

Anota en **[TEST-RESULTS.md](./TEST-RESULTS.md)** en la sección "BUGS ENCONTRADOS":

```
| # | Severidad | Área | Descripción | Pasos para reproducir |
|---|-----------|------|-------------|----------------------|
| 1 | 🔴 | Login | App crash al intentar login | 1. Abrir app, 2. Click login, 3. Crash |
```

**Severidades:**
- 🔴 Crítico: App no funciona, bloqueante
- 🟡 Mayor: Feature rota pero app usable
- 🟢 Menor: Cosmético, typo, etc.

---

## ⚠️ Problemas Comunes

### "No se puede conectar a Supabase"
```bash
# Verificar .env
cat .env | grep SUPABASE_URL

# Debe ser:
EXPO_PUBLIC_SUPABASE_URL=https://srmhqcjbngrxmhnwfedq.supabase.co
```

### "Stripe no funciona"
```bash
# Verificar .env
cat .env | grep STRIPE

# Debe ser:
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### "App no carga"
```bash
# Limpiar caché y reiniciar
npx expo start --clear
```

### Ver logs de la app
La terminal donde corre `expo start` mostrará los logs en tiempo real.

---

## 📊 Objetivo DÍA 1

**Meta:** Completar testing de Autenticación + Wallet (30 tests)

**Tiempo estimado:** 2-3 horas

**Archivos a usar:**
- **[TEST-RESULTS.md](./TEST-RESULTS.md)** - Ir marcando checks ✅
- **[TESTING-GUIDE.md](./TESTING-GUIDE.md)** - Referencia detallada

---

## 🎯 Al Terminar DÍA 1

1. Completar todos los checks en **[TEST-RESULTS.md](./TEST-RESULTS.md)**
2. Documentar todos los bugs encontrados
3. Llenar resumen al final del archivo
4. Avisar para que arregle bugs críticos (🔴) si los hay
5. Continuar con DÍA 2

---

## 💡 Tips

- **No te apresures** - Mejor 100% de cobertura lento que rápido y malo
- **Anota TODO** - Cualquier comportamiento extraño
- **Screenshots** - Si encuentras bug visual, toma screenshot
- **Reproduce bugs** - Si falla algo, intenta reproducirlo 2-3 veces
- **Pregunta si tienes dudas** - Mejor preguntar que asumir

---

## 🚦 Estado

```
✅ Servidor de desarrollo: CORRIENDO
⏳ Testing DÍA 1: EN PROGRESO
📋 Archivo de resultados: TEST-RESULTS.md
```

**¡Buena suerte con el testing!** 🧪🚀

---

**Siguiente:** Después de DÍA 1 → DÍA 2 (Gastos + OCR + Manutención)
