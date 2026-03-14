import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

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

  return <Slot />;
}
