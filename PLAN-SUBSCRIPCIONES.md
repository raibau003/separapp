# 💎 Plan de Implementación - Sistema de Subscripciones

**Fecha:** 14 de Marzo, 2026
**Objetivo:** Implementar modelo Freemium con Plan Gratis + Plan Premium
**Tiempo estimado:** 3-4 días de desarrollo

---

## 📊 Modelo de Negocio

### Plan Gratis (Forever Free)
```
✅ 1 familia
✅ 20 gastos por mes
✅ Mensajes ilimitados (SIN filtro de IA)
✅ Calendario básico (20 eventos/mes)
✅ 1 tarjeta guardada
✅ Liquidaciones manuales
❌ OCR para boletas (entrada manual solamente)
❌ Cobros automáticos
❌ Exportar reportes PDF
❌ Soporte prioritario
```

### Plan Premium ($4.99 USD/mes)
```
✅ Familias ilimitadas
✅ Gastos ilimitados
✅ OCR con IA para escanear boletas
✅ Filtro de IA en mensajería
✅ Calendario ilimitado
✅ Tarjetas ilimitadas
✅ Cobros automáticos mensuales
✅ Exportar reportes PDF
✅ Estadísticas avanzadas
✅ Soporte prioritario
✅ Acceso anticipado a nuevas features
```

### Precios por región
```
🇺🇸 USA: $4.99 USD/mes
🇨🇱 Chile: $3.990 CLP/mes (~$4.50 USD)
🇦🇷 Argentina: $2.990 ARS/mes (~$3 USD)
🇲🇽 México: $89 MXN/mes (~$5 USD)
🇪🇸 España: €4.49/mes
```

---

## 🏗️ Arquitectura de Implementación

### Opción 1: Solo Stripe (Más Simple)
```
✅ Pros:
- Más rápido de implementar (1-2 días)
- Un solo sistema de pagos
- Billing portal incluido
- Webhooks simples

❌ Contras:
- Apple rechazará la app (requiere IAP para subscripciones digitales)
- Solo funciona en Android inicialmente
- Tendrías que implementar IAP después para iOS
```

### Opción 2: Hybrid (Stripe + In-App Purchase) - RECOMENDADO
```
✅ Pros:
- Cumple con políticas de Apple y Google
- Mejor experiencia de usuario (pago nativo)
- Aprobación garantizada en tiendas

❌ Contras:
- Más complejo (3-4 días)
- Apple toma 30% (primer año), 15% (después)
- Google toma 15%
- Dos sistemas de pago a mantener

Flujo:
- iOS → In-App Purchase (Apple toma comisión)
- Android → In-App Purchase (Google toma comisión)
- Web (futuro) → Stripe directamente (sin comisión extra)
```

---

## 📋 Implementación Paso a Paso

### FASE A: Base de Datos (1 hora)

#### 1. Nueva tabla `subscriptions`
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Plan actual
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),

  -- Stripe (para web/legacy)
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,

  -- In-App Purchase (iOS)
  apple_transaction_id TEXT UNIQUE,
  apple_original_transaction_id TEXT,

  -- In-App Purchase (Android)
  google_purchase_token TEXT UNIQUE,
  google_order_id TEXT,

  -- Estado de subscripción
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'expired')),

  -- Periodo actual
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,

  -- Cancelación
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,

  -- Trial (opcional - 7 días gratis)
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id) -- Un usuario, una subscripción
);

-- Índices
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_apple_tx_id ON subscriptions(apple_transaction_id);
CREATE INDEX idx_subscriptions_google_token ON subscriptions(google_purchase_token);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 2. Nueva tabla `usage_limits` (para Free tier)
```sql
CREATE TABLE usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,

  -- Contadores del mes actual
  expenses_count INT DEFAULT 0,
  calendar_events_count INT DEFAULT 0,
  payment_methods_count INT DEFAULT 0,

  -- Mes de referencia
  month DATE NOT NULL, -- Formato: '2026-03-01'

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, family_id, month)
);

-- Índices
CREATE INDEX idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX idx_usage_limits_month ON usage_limits(month);

-- RLS
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON usage_limits FOR SELECT
  USING (auth.uid() = user_id);
```

#### 3. Función para resetear límites mensualmente
```sql
CREATE OR REPLACE FUNCTION reset_monthly_usage_limits()
RETURNS void AS $$
BEGIN
  -- Archivar límites del mes pasado (opcional)
  -- Crear nuevos registros para el mes actual para usuarios free
  INSERT INTO usage_limits (user_id, family_id, month, expenses_count, calendar_events_count, payment_methods_count)
  SELECT
    fm.user_id,
    fm.family_id,
    DATE_TRUNC('month', NOW())::DATE,
    0,
    0,
    0
  FROM family_members fm
  INNER JOIN subscriptions s ON s.user_id = fm.user_id
  WHERE s.plan_type = 'free'
  ON CONFLICT (user_id, family_id, month) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
```

---

### FASE B: In-App Purchase Setup (2-3 horas)

#### 1. Instalar dependencias
```bash
npx expo install expo-store-review expo-in-app-purchases
npm install react-native-iap
```

#### 2. Configurar productos en App Store Connect
```
1. Ir a: https://appstoreconnect.apple.com
2. Tu app → Features → In-App Purchases
3. Click "+" → Auto-Renewable Subscription
4. Crear Subscription Group: "SeparApp Premium"
5. Crear producto:
   - Reference Name: SeparApp Premium Monthly
   - Product ID: com.raibau003.separapp.premium.monthly
   - Subscription Duration: 1 month
   - Price: $4.99 USD (Tier 5)
   - Localized titles y descriptions
6. Habilitar Family Sharing (opcional)
7. Submit for review junto con la app
```

#### 3. Configurar productos en Google Play Console
```
1. Ir a: https://play.google.com/console
2. Tu app → Monetize → Subscriptions
3. Click "Create subscription"
4. Product ID: premium_monthly (debe coincidir con iOS)
5. Name: SeparApp Premium
6. Description: Acceso completo a todas las features premium
7. Billing period: 1 month
8. Price: $4.99 USD
9. Grace period: 3 days
10. Free trial: 7 days (opcional)
11. Save
```

#### 4. Crear archivo de configuración de productos
**lib/iap-products.ts**
```typescript
export const IAP_PRODUCTS = {
  premium: {
    ios: 'com.raibau003.separapp.premium.monthly',
    android: 'premium_monthly',
  },
} as const;

export type PlanType = 'free' | 'premium';

export const PLAN_LIMITS = {
  free: {
    families: 1,
    expenses_per_month: 20,
    calendar_events_per_month: 20,
    payment_methods: 1,
    ocr_enabled: false,
    ai_filter_enabled: false,
    auto_charge_enabled: false,
    pdf_export_enabled: false,
  },
  premium: {
    families: Infinity,
    expenses_per_month: Infinity,
    calendar_events_per_month: Infinity,
    payment_methods: Infinity,
    ocr_enabled: true,
    ai_filter_enabled: true,
    auto_charge_enabled: true,
    pdf_export_enabled: true,
  },
} as const;
```

---

### FASE C: Hooks y Lógica de Subscripción (3-4 horas)

#### 1. Hook de subscripción
**hooks/useSubscription.ts**
```typescript
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { IAP_PRODUCTS, PlanType, PLAN_LIMITS } from '@/lib/iap-products';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Cargar subscripción del usuario
  useEffect(() => {
    if (!user) return;
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Si no existe, crear subscripción free
      if (!data) {
        const { data: newSub } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
          })
          .select()
          .single();
        setSubscription(newSub);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Inicializar IAP
  useEffect(() => {
    initIAP();
    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const initIAP = async () => {
    try {
      await InAppPurchases.connectAsync();

      // Listener para compras
      InAppPurchases.setPurchaseListener(async ({ responseCode, results }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          for (const purchase of results!) {
            if (!purchase.acknowledged) {
              await processPurchase(purchase);
              await InAppPurchases.finishTransactionAsync(purchase, true);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing IAP:', error);
    }
  };

  // Procesar compra
  const processPurchase = async (purchase: any) => {
    try {
      const updateData: any = {
        plan_type: 'premium',
        status: 'active',
        current_period_start: new Date().toISOString(),
        // Período de 1 mes
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (Platform.OS === 'ios') {
        updateData.apple_transaction_id = purchase.transactionId;
        updateData.apple_original_transaction_id = purchase.originalTransactionId;
      } else {
        updateData.google_purchase_token = purchase.purchaseToken;
        updateData.google_order_id = purchase.orderId;
      }

      await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', user.id);

      await loadSubscription();
    } catch (error) {
      console.error('Error processing purchase:', error);
      throw error;
    }
  };

  // Comprar Premium
  const purchasePremium = async () => {
    try {
      setPurchasing(true);

      const productId = Platform.OS === 'ios'
        ? IAP_PRODUCTS.premium.ios
        : IAP_PRODUCTS.premium.android;

      await InAppPurchases.purchaseItemAsync(productId);

      // processPurchase se ejecuta automáticamente vía listener
    } catch (error: any) {
      if (error.code === 'E_USER_CANCELLED') {
        console.log('User cancelled purchase');
      } else {
        console.error('Error purchasing:', error);
        throw error;
      }
    } finally {
      setPurchasing(false);
    }
  };

  // Restaurar compras (para usuarios que reinstalaron)
  const restorePurchases = async () => {
    try {
      setLoading(true);
      const { results } = await InAppPurchases.getPurchaseHistoryAsync();

      if (results && results.length > 0) {
        // Procesar la compra más reciente
        const latestPurchase = results[0];
        await processPurchase(latestPurchase);
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar subscripción (redirige a App Store/Play Store)
  const cancelSubscription = async () => {
    if (Platform.OS === 'ios') {
      // iOS: abrir App Store subscriptions
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      // Android: abrir Google Play subscriptions
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  // Verificar si tiene acceso a feature
  const hasFeatureAccess = (feature: keyof typeof PLAN_LIMITS.premium): boolean => {
    if (!subscription) return false;
    const plan = subscription.plan_type as PlanType;
    return PLAN_LIMITS[plan][feature] as boolean;
  };

  // Verificar límites de uso
  const checkUsageLimit = async (
    limitType: 'expenses' | 'calendar_events' | 'payment_methods',
    familyId: string
  ): Promise<{ allowed: boolean; current: number; limit: number }> => {
    if (subscription?.plan_type === 'premium') {
      return { allowed: true, current: 0, limit: Infinity };
    }

    // Obtener uso actual del mes
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const { data: usage } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('family_id', familyId)
      .eq('month', currentMonth)
      .single();

    const countField = `${limitType}_count`;
    const current = usage?.[countField] || 0;
    const limit = PLAN_LIMITS.free[`${limitType}_per_month`];

    return {
      allowed: current < limit,
      current,
      limit,
    };
  };

  // Incrementar contador de uso
  const incrementUsage = async (
    limitType: 'expenses' | 'calendar_events' | 'payment_methods',
    familyId: string
  ) => {
    if (subscription?.plan_type === 'premium') return; // Premium no tiene límites

    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const countField = `${limitType}_count`;

    await supabase.rpc('increment_usage_limit', {
      p_user_id: user.id,
      p_family_id: familyId,
      p_month: currentMonth,
      p_field: countField,
    });
  };

  return {
    subscription,
    loading,
    purchasing,
    isPremium: subscription?.plan_type === 'premium',
    purchasePremium,
    restorePurchases,
    cancelSubscription,
    hasFeatureAccess,
    checkUsageLimit,
    incrementUsage,
    refresh: loadSubscription,
  };
};
```

#### 2. Función SQL para incrementar uso
```sql
CREATE OR REPLACE FUNCTION increment_usage_limit(
  p_user_id UUID,
  p_family_id UUID,
  p_month DATE,
  p_field TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO usage_limits (user_id, family_id, month, expenses_count, calendar_events_count, payment_methods_count)
  VALUES (p_user_id, p_family_id, p_month,
    CASE WHEN p_field = 'expenses_count' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'calendar_events_count' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'payment_methods_count' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, family_id, month)
  DO UPDATE SET
    expenses_count = CASE WHEN p_field = 'expenses_count' THEN usage_limits.expenses_count + 1 ELSE usage_limits.expenses_count END,
    calendar_events_count = CASE WHEN p_field = 'calendar_events_count' THEN usage_limits.calendar_events_count + 1 ELSE usage_limits.calendar_events_count END,
    payment_methods_count = CASE WHEN p_field = 'payment_methods_count' THEN usage_limits.payment_methods_count + 1 ELSE usage_limits.payment_methods_count END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

---

### FASE D: UI de Subscripción (2-3 horas)

#### 1. Pantalla de Pricing
**app/pricing.tsx**
```typescript
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';

export default function PricingScreen() {
  const router = useRouter();
  const { subscription, isPremium, purchasePremium, purchasing, restorePurchases } = useSubscription();

  const handlePurchase = async () => {
    try {
      await purchasePremium();
      Alert.alert('¡Éxito!', 'Ahora tienes acceso a SeparApp Premium');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la compra. Intenta de nuevo.');
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert('Compras restauradas', 'Tu subscripción ha sido restaurada exitosamente');
    } catch (error) {
      Alert.alert('No se encontraron compras', 'No tienes compras previas para restaurar');
    }
  };

  if (isPremium) {
    return (
      <View className="flex-1 bg-white p-6">
        <Text className="text-2xl font-bold text-center mb-4">¡Eres Premium! 🎉</Text>
        <Text className="text-gray-600 text-center">
          Disfruta de todas las features de SeparApp sin límites
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 bg-indigo-600">
        <Text className="text-3xl font-bold text-white text-center mb-2">
          Elige tu plan
        </Text>
        <Text className="text-indigo-200 text-center">
          Comienza gratis, actualiza cuando quieras
        </Text>
      </View>

      {/* Plans */}
      <View className="p-6 space-y-4">
        {/* Free Plan */}
        <View className="border-2 border-gray-200 rounded-2xl p-6">
          <Text className="text-xl font-bold mb-2">Plan Gratis</Text>
          <Text className="text-3xl font-bold mb-4">$0<Text className="text-base text-gray-500">/mes</Text></Text>

          <View className="space-y-2 mb-4">
            <Feature icon="checkmark-circle" text="1 familia" />
            <Feature icon="checkmark-circle" text="20 gastos/mes" />
            <Feature icon="checkmark-circle" text="Mensajes ilimitados" />
            <Feature icon="checkmark-circle" text="20 eventos calendario/mes" />
            <Feature icon="checkmark-circle" text="1 tarjeta guardada" />
            <Feature icon="close-circle" text="OCR para boletas" color="text-gray-400" />
            <Feature icon="close-circle" text="Filtro IA en mensajes" color="text-gray-400" />
            <Feature icon="close-circle" text="Cobros automáticos" color="text-gray-400" />
          </View>

          {subscription?.plan_type === 'free' && (
            <View className="bg-gray-100 rounded-lg p-3">
              <Text className="text-gray-600 text-center font-medium">Plan Actual</Text>
            </View>
          )}
        </View>

        {/* Premium Plan */}
        <View className="border-2 border-indigo-600 rounded-2xl p-6 bg-indigo-50">
          <View className="absolute -top-3 right-4 bg-indigo-600 px-3 py-1 rounded-full">
            <Text className="text-white font-bold text-xs">RECOMENDADO</Text>
          </View>

          <Text className="text-xl font-bold mb-2">Plan Premium</Text>
          <Text className="text-3xl font-bold text-indigo-600 mb-4">
            $4.99<Text className="text-base text-gray-500">/mes</Text>
          </Text>

          <View className="space-y-2 mb-6">
            <Feature icon="checkmark-circle" text="Familias ilimitadas" color="text-indigo-600" />
            <Feature icon="checkmark-circle" text="Gastos ilimitados" color="text-indigo-600" />
            <Feature icon="checkmark-circle" text="OCR para escanear boletas" color="text-indigo-600" />
            <Feature icon="checkmark-circle" text="Filtro de IA en mensajes" color="text-indigo-600" />
            <Feature icon="checkmark-circle" text="Calendario ilimitado" color="text-indigo-600" />
            <Feature icon="checkmark-circle" text="Tarjetas ilimitadas" color="text-indigo-600" />
            <Feature icon="checkmark-circle" text="Cobros automáticos" color="text-indigo-600" />
            <Feature icon="checkmark-circle" text="Exportar PDF" color="text-indigo-600" />
            <Feature icon="checkmark-circle" text="Soporte prioritario" color="text-indigo-600" />
          </View>

          <TouchableOpacity
            onPress={handlePurchase}
            disabled={purchasing}
            className="bg-indigo-600 rounded-xl p-4 items-center"
          >
            {purchasing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Actualizar a Premium</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Restore Purchases */}
      <TouchableOpacity onPress={handleRestore} className="p-4">
        <Text className="text-indigo-600 text-center font-medium">
          Restaurar compras
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View className="p-6 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center mb-2">
          La subscripción se renueva automáticamente. Puedes cancelar en cualquier momento.
        </Text>
        <Text className="text-xs text-gray-500 text-center">
          Al subscribirte aceptas nuestros Términos y Condiciones
        </Text>
      </View>
    </ScrollView>
  );
}

function Feature({ icon, text, color = "text-gray-700" }: { icon: string; text: string; color?: string }) {
  return (
    <View className="flex-row items-center space-x-2">
      <Ionicons name={icon as any} size={20} className={color} />
      <Text className={`${color} flex-1`}>{text}</Text>
    </View>
  );
}
```

#### 2. Componente de Upgrade Prompt
**components/UpgradePrompt.tsx**
```typescript
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function UpgradePrompt({
  visible,
  onClose,
  feature,
  currentUsage,
  limit
}: {
  visible: boolean;
  onClose: () => void;
  feature: string;
  currentUsage?: number;
  limit?: number;
}) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-md">
          <View className="items-center mb-4">
            <View className="bg-indigo-100 rounded-full p-4 mb-4">
              <Ionicons name="lock-closed" size={32} color="#6366f1" />
            </View>
            <Text className="text-2xl font-bold text-center mb-2">
              Actualiza a Premium
            </Text>
            <Text className="text-gray-600 text-center">
              {feature}
            </Text>
          </View>

          {currentUsage !== undefined && limit !== undefined && (
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <Text className="text-gray-700 text-center">
                Has usado <Text className="font-bold">{currentUsage}/{limit}</Text> este mes
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleUpgrade}
            className="bg-indigo-600 rounded-xl p-4 mb-3"
          >
            <Text className="text-white font-bold text-center text-lg">
              Ver Planes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} className="p-3">
            <Text className="text-gray-600 text-center font-medium">
              Más tarde
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
```

---

### FASE E: Integrar Feature Gates (2-3 horas)

#### Ejemplo: Limitar creación de gastos

**En `app/(tabs)/gastos.tsx`:**
```typescript
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/UpgradePrompt';

const [showUpgrade, setShowUpgrade] = useState(false);
const [upgradeMessage, setUpgradeMessage] = useState('');
const { isPremium, checkUsageLimit } = useSubscription();

const handleCreateExpense = async () => {
  // Verificar límite
  const { allowed, current, limit } = await checkUsageLimit('expenses', familyId);

  if (!allowed) {
    setUpgradeMessage('Has alcanzado el límite de 20 gastos este mes');
    setShowUpgrade(true);
    return;
  }

  // Continuar con creación normal...
  await createExpense(data);

  // Incrementar contador
  await incrementUsage('expenses', familyId);
};

// En el render:
<UpgradePrompt
  visible={showUpgrade}
  onClose={() => setShowUpgrade(false)}
  feature={upgradeMessage}
/>
```

Similar para:
- Calendario (limitar eventos)
- Wallet (limitar tarjetas)
- OCR (deshabilitar si es free)
- Filtro IA (deshabilitar si es free)

---

### FASE F: Webhooks y Validación (2 horas)

#### 1. Apple Server-to-Server Notifications
**supabase/functions/apple-iap-webhook/index.ts**
```typescript
// Validar notificaciones de Apple sobre cambios de subscripción
// (renovación, cancelación, reembolso, etc.)
```

#### 2. Google Real-time Developer Notifications
**supabase/functions/google-iap-webhook/index.ts**
```typescript
// Validar notificaciones de Google sobre cambios de subscripción
```

#### 3. Cron Job para verificar subscripciones expiradas
```typescript
// Ejecutar diariamente
// Marcar como expiradas las subscripciones cuyo current_period_end < NOW()
```

---

### FASE G: Testing (1-2 días)

1. **Sandbox Testing (iOS)**
   - Crear cuenta sandbox en App Store Connect
   - Probar compra, renovación, cancelación, restauración

2. **Testing (Android)**
   - Agregar cuenta de prueba en Google Play Console
   - Probar flujo completo

3. **Verificar límites**
   - Crear 21 gastos en plan free → debe bloquear
   - Actualizar a premium → debe permitir ilimitados
   - Cancelar → debe volver a free al final del periodo

---

## 📊 Estimaciones Financieras

### Costos
```
Apple Developer: $99/año
Google Play Console: $25 una vez
Supabase (crecimiento): ~$25/mes (hasta 50k usuarios)
Stripe: $0 (solo comisión por transacción)

TOTAL primer año: ~$424
TOTAL años siguientes: ~$399/año
```

### Ingresos (ejemplo conservador)
```
Mes 1: 100 usuarios, 5% premium = 5 subs × $4.99 = $24.95
  - Comisión Apple/Google (30%): -$7.48
  = $17.47/mes neto

Mes 6: 1,000 usuarios, 8% premium = 80 subs × $4.99 = $399
  - Comisión (30%): -$119.70
  = $279.30/mes neto

Mes 12: 5,000 usuarios, 10% premium = 500 subs × $4.99 = $2,495
  - Comisión (30%): -$748.50
  = $1,746.50/mes neto

Año 1 total: ~$10,000-15,000 (conservador)
```

---

## ✅ Checklist de Implementación

- [ ] **FASE A:** Crear tablas SQL (subscriptions, usage_limits)
- [ ] **FASE B:** Configurar IAP en App Store Connect y Google Play Console
- [ ] **FASE B:** Instalar dependencias (expo-in-app-purchases, react-native-iap)
- [ ] **FASE C:** Crear hook useSubscription con toda la lógica
- [ ] **FASE C:** Crear función SQL increment_usage_limit
- [ ] **FASE D:** Crear pantalla /pricing
- [ ] **FASE D:** Crear componente UpgradePrompt
- [ ] **FASE E:** Integrar feature gates en gastos, calendario, wallet, OCR
- [ ] **FASE F:** Crear webhooks de Apple y Google
- [ ] **FASE F:** Crear cron job para expirar subscripciones
- [ ] **FASE G:** Testing completo en sandbox
- [ ] **Docs:** Actualizar README con info de planes
- [ ] **Docs:** Crear política de privacidad mencionando IAP
- [ ] **Docs:** Crear términos y condiciones de subscripción

---

## 🚨 Consideraciones Importantes

### Legal
- ✅ Necesitas **Términos y Condiciones** específicos para subscripciones
- ✅ Necesitas **Política de Reembolsos** (Apple/Google manejan esto)
- ✅ Actualizar **Privacy Policy** mencionando procesamiento de pagos

### UX
- ✅ Mostrar claramente qué está incluido en cada plan
- ✅ No ser agresivo con los prompts de upgrade
- ✅ Permitir que usuarios free tengan buena experiencia (no frustrar)
- ✅ Trial de 7 días gratis (opcional pero recomendado)

### Apple Review
- ✅ Apple requiere que el botón de compra sea claro
- ✅ No puedes mencionar "más barato en web" o redirigir a Stripe
- ✅ Debes usar StoreKit 2 (expo-in-app-purchases lo hace)
- ✅ Debes ofrecer restauración de compras

---

## 📅 Timeline

```
Día 1: FASE A + B (DB + IAP setup) - 4-5 horas
Día 2: FASE C (Hook de subscripción) - 6-7 horas
Día 3: FASE D + E (UI + Feature gates) - 6-7 horas
Día 4: FASE F + G (Webhooks + Testing) - 6-8 horas

TOTAL: 3-4 días de desarrollo full-time
```

---

## 🎯 Resultado Final

Al terminar esta implementación tendrás:

✅ Sistema de subscripciones completo compatible con App Store y Google Play
✅ Plan Gratis con límites razonables
✅ Plan Premium a $4.99/mes con todas las features
✅ Feature gates en toda la app
✅ Webhooks para sincronizar estado de subscripciones
✅ UI/UX pulida para upgrade
✅ Sistema listo para escalar y generar ingresos recurrentes

---

**¿Listo para empezar?** Dime y comenzamos con FASE A (Base de datos).
