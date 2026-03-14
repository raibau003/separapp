/**
 * Este archivo contendrá los tipos generados automáticamente de Supabase.
 * Ejecuta: npx supabase gen types typescript --project-id srmhqcjbngrxmhnwfedq > types/database.ts
 *
 * Por ahora, definimos una estructura básica que será reemplazada.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      // Más tablas serán agregadas cuando se generen desde Supabase
    }
  }
}
