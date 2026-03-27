import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Family } from '@/types/app';

interface FamilyStore {
  currentFamily: Family | null;
  families: Family[];
  loading: boolean;
  setCurrentFamily: (family: Family | null) => void;
  setFamilies: (families: Family[]) => void;
  loadFamilies: (userId: string) => Promise<void>;
  createFamily: (name: string) => Promise<Family | null>;
}

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set, get) => ({
      currentFamily: null,
      families: [],
      loading: false,

      setCurrentFamily: (family) => {
        set({ currentFamily: family });
      },

      setFamilies: (families) => {
        set({ families });
        // Si no hay familia seleccionada, seleccionar la primera
        if (families.length > 0 && !get().currentFamily) {
          set({ currentFamily: families[0] });
        }
      },

      loadFamilies: async (userId: string) => {
        set({ loading: true });
        try {
          // 1. Obtener family_members del usuario
          const { data: members, error: membersError } = await supabase
            .from('family_members')
            .select('family_id')
            .eq('user_id', userId);

          if (membersError) throw membersError;

          if (!members || members.length === 0) {
            set({ families: [], currentFamily: null, loading: false });
            return;
          }

          // 2. Obtener las familias
          const familyIds = members.map((m) => m.family_id);
          const { data: families, error: familiesError } = await supabase
            .from('families')
            .select('*')
            .in('id', familyIds);

          if (familiesError) throw familiesError;

          set({
            families: families || [],
            currentFamily: families && families.length > 0 ? families[0] : null,
            loading: false,
          });
        } catch (error) {
          console.error('Error loading families:', error);
          set({ families: [], currentFamily: null, loading: false });
        }
      },

      createFamily: async (name: string) => {
        try {
          const { data: newFamily, error: familyError } = await supabase
            .from('families')
            .insert([{ name }])
            .select()
            .single();

          if (familyError) throw familyError;

          // Agregar el usuario como padre/madre de la familia
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user) {
            const { error: memberError } = await supabase
              .from('family_members')
              .insert([
                {
                  family_id: newFamily.id,
                  user_id: authData.user.id,
                  role: 'padre',
                },
              ]);

            if (memberError) throw memberError;
          }

          // Actualizar el store
          const families = [...get().families, newFamily];
          set({
            families,
            currentFamily: newFamily,
          });

          return newFamily;
        } catch (error) {
          console.error('Error creating family:', error);
          return null;
        }
      },
    }),
    {
      name: 'family-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
