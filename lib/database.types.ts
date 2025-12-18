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
          updated_at: string
          user_id: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
        }
      },
      workout_days: {
        Row: {
          id: string
          workout_id: string
          day_id: string
          name: string
          exercises: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          day_id: string
          name: string
          exercises?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          day_id?: string
          name?: string
          exercises?: Json
          created_at?: string
          updated_at?: string
        }
      },
      workout_logs: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          workout_day_id: string | null
          exercise_name: string
          weight: number
          avg_reps: number
          sets: number // Added column
          performed_at: string // ISO date string (YYYY-MM-DD)
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          workout_day_id?: string | null
          exercise_name: string
          weight: number
          avg_reps: number
          sets?: number // Added column (optional in insert if default exists, but good to have)
          performed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          workout_day_id?: string | null
          exercise_name?: string
          weight?: number
          avg_reps?: number
          sets?: number // Added column
          performed_at?: string
          created_at?: string
          updated_at?: string
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