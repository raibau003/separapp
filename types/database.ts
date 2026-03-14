/**
 * TIPOS DE BASE DE DATOS - SUPABASE
 *
 * Para regenerar estos tipos automáticamente desde Supabase:
 * npx supabase gen types typescript --project-id srmhqcjbngrxmhnwfedq > types/database.ts
 *
 * Estos tipos están sincronizados con el esquema en supabase-schema.sql
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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: 'padre' | 'madre' | 'hijo' | 'mediador' | 'juez'
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role: 'padre' | 'madre' | 'hijo' | 'mediador' | 'juez'
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: 'padre' | 'madre' | 'hijo' | 'mediador' | 'juez'
          created_at?: string
        }
      }
      children: {
        Row: {
          id: string
          family_id: string
          full_name: string
          birth_date: string
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          full_name: string
          birth_date: string
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          full_name?: string
          birth_date?: string
          photo_url?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          family_id: string
          child_id: string
          declared_by: string
          amount: number
          currency: 'CLP' | 'ARS' | 'MXN' | 'EUR'
          category: 'educacion' | 'salud' | 'ropa' | 'alimentacion' | 'deporte' | 'transporte' | 'otros'
          description: string
          receipt_url: string | null
          ocr_data: Json | null
          status: 'pending' | 'approved' | 'rejected'
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          child_id: string
          declared_by: string
          amount: number
          currency?: 'CLP' | 'ARS' | 'MXN' | 'EUR'
          category: 'educacion' | 'salud' | 'ropa' | 'alimentacion' | 'deporte' | 'transporte' | 'otros'
          description: string
          receipt_url?: string | null
          ocr_data?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          child_id?: string
          declared_by?: string
          amount?: number
          currency?: 'CLP' | 'ARS' | 'MXN' | 'EUR'
          category?: 'educacion' | 'salud' | 'ropa' | 'alimentacion' | 'deporte' | 'transporte' | 'otros'
          description?: string
          receipt_url?: string | null
          ocr_data?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
      }
      maintenance_payments: {
        Row: {
          id: string
          family_id: string
          amount: number
          currency: 'CLP' | 'ARS' | 'MXN' | 'EUR'
          frequency: 'mensual' | 'quincenal'
          due_date: string
          paid_date: string | null
          paid_by: string | null
          receipt_url: string | null
          status: 'pending' | 'paid' | 'late'
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          amount: number
          currency?: 'CLP' | 'ARS' | 'MXN' | 'EUR'
          frequency: 'mensual' | 'quincenal'
          due_date: string
          paid_date?: string | null
          paid_by?: string | null
          receipt_url?: string | null
          status?: 'pending' | 'paid' | 'late'
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          amount?: number
          currency?: 'CLP' | 'ARS' | 'MXN' | 'EUR'
          frequency?: 'mensual' | 'quincenal'
          due_date?: string
          paid_date?: string | null
          paid_by?: string | null
          receipt_url?: string | null
          status?: 'pending' | 'paid' | 'late'
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          family_id: string
          sender_id: string
          content: string
          original_content: string | null
          ai_filtered: boolean
          ai_suggestion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          sender_id: string
          content: string
          original_content?: string | null
          ai_filtered?: boolean
          ai_suggestion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          sender_id?: string
          content?: string
          original_content?: string | null
          ai_filtered?: boolean
          ai_suggestion?: string | null
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          family_id: string
          child_id: string | null
          title: string
          start_date: string
          end_date: string
          type: 'custody' | 'activity' | 'school' | 'exchange'
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          child_id?: string | null
          title: string
          start_date: string
          end_date: string
          type: 'custody' | 'activity' | 'school' | 'exchange'
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          child_id?: string | null
          title?: string
          start_date?: string
          end_date?: string
          type?: 'custody' | 'activity' | 'school' | 'exchange'
          created_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_late_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
