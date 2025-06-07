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
          exercises: Json
          completed_exercises: Json
          last_sync_time: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          exercises: Json
          completed_exercises: Json
          last_sync_time?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          exercises?: Json
          completed_exercises?: Json
          last_sync_time?: string | null
        }
      }
      workout_sessions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          workout_id: string
          exercise_id: string
          exercise_name: string
          weight: number
          reps: number
          sets: number
          completed_exercises: Json
          duration: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          workout_id: string
          exercise_id: string
          exercise_name: string
          weight: number
          reps: number
          sets: number
          completed_exercises: Json
          duration: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          workout_id?: string
          exercise_id?: string
          exercise_name?: string
          weight?: number
          reps?: number
          sets?: number
          completed_exercises?: Json
          duration?: number
          notes?: string | null
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