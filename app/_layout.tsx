import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
// Stripe disabled for web support
// import { StripeProvider } from '@stripe/stripe-react-native';
import { useAuth } from '@/hooks/useAuth';
// import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';

export default function RootLayout() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirigir a login si no está autenticado
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirigir a tabs si ya está autenticado
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments]);

  return (
    // Stripe disabled for web
    // <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    <Slot />
    // </StripeProvider>
  );
}
