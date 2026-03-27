import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { signOut as authSignOut } from '@/lib/authSync';
import { useFamilyStore } from './familyStore';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  google_id?: string;
  auth_provider?: string;
  stripe_customer_id?: string;
  push_token?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  signOut: async () => {
    await authSignOut();
    set({ user: null, profile: null, session: null });
  },

  loadProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  },

  initialize: async () => {
    set({ loading: true });

    const { data: { session } } = await supabase.auth.getSession();

    set({
      session,
      user: session?.user ?? null,
      loading: false
    });

    // Cargar perfil y familias si hay sesión
    if (session?.user) {
      get().loadProfile(session.user.id);
      useFamilyStore.getState().loadFamilies(session.user.id);
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({
        session,
        user: session?.user ?? null
      });

      if (session?.user) {
        get().loadProfile(session.user.id);
        useFamilyStore.getState().loadFamilies(session.user.id);
      } else {
        set({ profile: null });
      }
    });
  },
}));
