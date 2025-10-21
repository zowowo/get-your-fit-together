export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string
          workout_id: string
          name: string
          sets: number | null
          reps: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          sets?: number | null
          reps?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          sets?: number | null
          reps?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
        }
      }
      workouts: {
        Row: {
          id: string
          title: string
          description: string | null
          difficulty: string | null
          is_public: boolean
          owner: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          difficulty?: string | null
          is_public?: boolean
          owner: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          difficulty?: string | null
          is_public?: boolean
          owner?: string
          created_at?: string | null
          updated_at?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]