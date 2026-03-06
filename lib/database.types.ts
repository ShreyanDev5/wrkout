export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Database types generated from Supabase schema.
 * Last updated: 2025-12-18
 */
export interface Database {
  public: {
    Tables: {
      workouts: {
        Row: {
          id: string
          user_id: string | null
          name: string
          created_at: string
          updated_at: string

        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          created_at?: string
          updated_at?: string

        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          created_at?: string
          updated_at?: string

        }
      }
      workout_days: {
        Row: {
          id: string
          workout_id: string | null
          day_id: string
          name: string
          exercises: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_id?: string | null
          day_id: string
          name: string
          exercises?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workout_id?: string | null
          day_id?: string
          name?: string
          exercises?: Json
          created_at?: string
          updated_at?: string
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string | null
          workout_id: string | null
          workout_day_id: string | null
          exercise_name: string
          weight: number
          avg_reps: number
          sets: number
          volume: number
          performed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          workout_id?: string | null
          workout_day_id?: string | null
          exercise_name: string
          weight: number
          avg_reps: number
          sets?: number // Default: 1
          volume?: never // Generated column
          performed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          workout_id?: string | null
          workout_day_id?: string | null
          exercise_name?: string
          weight?: number
          avg_reps?: number
          sets?: number
          volume?: never // Generated column
          performed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string | null
          date: string
          workout_name: string | null
          total_exercises: number
          completed_exercises: number
          summary_stats: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          date?: string
          workout_name?: string | null
          total_exercises?: number
          completed_exercises?: number
          summary_stats?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          date?: string
          workout_name?: string | null
          total_exercises?: number
          completed_exercises?: number
          summary_stats?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_exercise_volume_trends: {
        Args: {
          p_user_id: string
          p_date?: string
        }
        Returns: {
          exercise_name: string
          workout_day_id: string | null
          today_volume: number
          previous_volume: number | null
          trend: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
