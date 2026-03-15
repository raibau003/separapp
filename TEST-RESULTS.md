# 📋 Resultados de Testing - SeparApp

**Fecha inicio:** 14 de Marzo, 2026
**Testeador:** Javier Correa
**Dispositivo:** [A completar]
**Plataforma:** [iOS / Android / Ambos]

---

## ✅ DÍA 1: Setup + Autenticación + Wallet

### Setup Inicial
- [ ] App inicia sin errores
- [ ] Pantalla de login se muestra correctamente
- [ ] No hay warnings críticos en consola

**Resultado:**
**Notas:**

---

### 1. Autenticación 🔴 CRÍTICO

#### 1.1 Registro con Email
- [ ] Botón "Crear cuenta" visible
- [ ] Formulario de registro se abre
- [ ] Email: test1@separapp.com
- [ ] Password: TestPass123!
- [ ] Registro exitoso
- [ ] Redirige a app principal
- [ ] Usuario creado en Supabase (verificar en dashboard)

**Resultado:** ✅ PASS / ❌ FAIL
**Tiempo:** ___ min
**Bugs encontrados:**

---

#### 1.2 Login con Email
- [ ] Logout funciona
- [ ] Vuelve a pantalla de login
- [ ] Email: test1@separapp.com
- [ ] Password: TestPass123!
- [ ] Login exitoso
- [ ] Redirige a app principal
- [ ] Datos cargados correctamente

**Resultado:** ✅ PASS / ❌ FAIL
**Bugs encontrados:**

---

#### 1.3 Login con Google
- [ ] Botón "Continuar con Google" visible
- [ ] Flujo de Google Sign-In funciona
- [ ] Usuario sincronizado en Supabase
- [ ] firebase_uid guardado correctamente
- [ ] auth_provider = 'google'

**Resultado:** ✅ PASS / ❌ FAIL / ⏭️ SKIP
**Notas:** (Skip si no tienes cuenta Google de prueba)

---

#### 1.4 Persistencia de Sesión
- [ ] Login exitoso
- [ ] Cerrar app completamente (force quit)
- [ ] Reabrir app
- [ ] Sigue logueado (no pide credenciales)
- [ ] Datos cargados

**Resultado:** ✅ PASS / ❌ FAIL
**Bugs encontrados:**

---

#### 1.5 Logout
- [ ] Botón/opción de logout visible
- [ ] Click en "Cerrar Sesión"
- [ ] Sesión cerrada correctamente
- [ ] Redirige a login
- [ ] No quedan datos en memoria

**Resultado:** ✅ PASS / ❌ FAIL
**Bugs encontrados:**

---

### 2. Wallet & Stripe 🔴 CRÍTICO

#### Preparación
- [ ] Verificar que .env tiene EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
- [ ] Tab "Wallet" visible en navegación

**Notas:**

---

#### 2.1 Agregar Tarjeta de Prueba (Exitosa)
- [ ] Ir a tab "Wallet"
- [ ] Botón "Agregar Tarjeta" visible
- [ ] Modal se abre
- [ ] Número: 4242 4242 4242 4242
- [ ] Expiración: 12/34
- [ ] CVV: 123
- [ ] ZIP: 12345
- [ ] Marcar como "predeterminada"
- [ ] Click "Guardar"
- [ ] Loading spinner visible
- [ ] Tarjeta guardada exitosamente
- [ ] Aparece en lista
- [ ] Badge "Predeterminada" visible
- [ ] Últimos 4 dígitos: ••••4242
- [ ] Marca: Visa
- [ ] Registro en Supabase (verificar en tabla payment_methods)

**Resultado:** ✅ PASS / ❌ FAIL
**Tiempo:** ___ min
**Bugs encontrados:**

---

#### 2.2 Agregar Segunda Tarjeta
- [ ] Click "Agregar Tarjeta"
- [ ] Número: 5555 5555 5555 4444
- [ ] Expiración: 12/34
- [ ] CVV: 123
- [ ] NO marcar como predeterminada
- [ ] Tarjeta guardada
- [ ] Primera sigue como predeterminada
- [ ] Ambas visibles en lista

**Resultado:** ✅ PASS / ❌ FAIL
**Bugs encontrados:**

---

#### 2.3 Cambiar Tarjeta Predeterminada
- [ ] En Mastercard (••••4444)
- [ ] Opción "Establecer como predeterminada" visible
- [ ] Click en opción
- [ ] Badge cambia a Mastercard
- [ ] Visa pierde el badge
- [ ] Cambio reflejado en Supabase

**Resultado:** ✅ PASS / ❌ FAIL
**Bugs encontrados:**

---

#### 2.4 Eliminar Tarjeta
- [ ] En tarjeta Visa (••••4242)
- [ ] Opción "Eliminar" visible
- [ ] Click "Eliminar"
- [ ] Confirmación solicitada
- [ ] Confirmar eliminación
- [ ] Tarjeta desaparece
- [ ] Solo queda Mastercard
- [ ] Registro eliminado de Supabase

**Resultado:** ✅ PASS / ❌ FAIL
**Bugs encontrados:**

---

#### 2.5 Tarjeta Declinada
- [ ] Agregar tarjeta: 4000 0000 0000 0002
- [ ] Expiración: 12/34
- [ ] CVV: 123
- [ ] Intentar guardar
- [ ] Error mostrado claramente
- [ ] Mensaje: "Tarjeta declinada" o similar
- [ ] Tarjeta NO guardada en BD

**Resultado:** ✅ PASS / ❌ FAIL
**Bugs encontrados:**

---

#### 2.6 Pull to Refresh en Wallet
- [ ] Swipe down desde el top
- [ ] Spinner de refresh visible
- [ ] Datos se actualizan
- [ ] Animación smooth

**Resultado:** ✅ PASS / ❌ FAIL
**Bugs encontrados:**

---

## 🐛 BUGS ENCONTRADOS - DÍA 1

| # | Severidad | Área | Descripción | Pasos para reproducir |
|---|-----------|------|-------------|----------------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Severidades:**
- 🔴 Crítico: Bloqueante, debe arreglarse antes de lanzar
- 🟡 Mayor: Importante pero no bloqueante
- 🟢 Menor: Nice to have, puede esperar

---

## 📊 Resumen DÍA 1

**Total tests ejecutados:** ___ / 30
**Tests exitosos:** ___
**Tests fallidos:** ___
**Tests skipped:** ___

**Bugs críticos:** ___
**Bugs mayores:** ___
**Bugs menores:** ___

**Tiempo total:** ___ horas

**Conclusión:**
[Escribir conclusión del día]

---

**Próximo paso:** DÍA 2 - Gastos + OCR + Manutención
