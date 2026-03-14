import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook personalizado para manejar la autenticación
 */
export function useAuth() {
  const { user, session, loading, signOut, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
