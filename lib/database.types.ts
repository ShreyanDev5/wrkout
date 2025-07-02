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
      workouts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
        }
      },
      workout_logs: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          exercise_name: string
          weight: number
          avg_reps: number
          performed_at: string // ISO date string (YYYY-MM-DD)
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          exercise_name: string
          weight: number
          avg_reps: number
          performed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          exercise_name?: string
          weight?: number
          avg_reps?: number
          performed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 