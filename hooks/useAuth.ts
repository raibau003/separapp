import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook personalizado para manejar la autenticación
 */
export function useAuth() {
  const { user, profile, session, loading, signOut, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user, // Supabase Auth user
    profile, // Profile from profiles table
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
