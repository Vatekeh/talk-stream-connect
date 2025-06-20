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
      changelog_entries: {
        Row: {
          bug_fixes: Json | null
          created_at: string | null
          created_by: string | null
          features: Json | null
          id: string
          improvements: Json | null
          is_current: boolean | null
          release_date: string
          version: string
        }
        Insert: {
          bug_fixes?: Json | null
          created_at?: string | null
          created_by?: string | null
          features?: Json | null
          id?: string
          improvements?: Json | null
          is_current?: boolean | null
          release_date: string
          version: string
        }
        Update: {
          bug_fixes?: Json | null
          created_at?: string | null
          created_by?: string | null
          features?: Json | null
          id?: string
          improvements?: Json | null
          is_current?: boolean | null
          release_date?: string
          version?: string
        }
        Relationships: []
      }
      detection_logs: {
        Row: {
          created_at: string
          details: Json | null
          detection_type: string
          id: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          detection_type: string
          id?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          detection_type?: string
          id?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detection_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nsfw_detections: {
        Row: {
          confidence: number
          detected_class: string
          id: string
          inserted_at: string
          media_url: string
          page_url: string
          thumb_base64: string | null
          user_id: string
        }
        Insert: {
          confidence: number
          detected_class: string
          id?: string
          inserted_at?: string
          media_url: string
          page_url: string
          thumb_base64?: string | null
          user_id: string
        }
        Update: {
          confidence?: number
          detected_class?: string
          id?: string
          inserted_at?: string
          media_url?: string
          page_url?: string
          thumb_base64?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_period_end: string | null
          current_streak: number | null
          id: string
          is_moderator: boolean | null
          last_activity: string | null
          longest_streak: number | null
          messages_posted: number | null
          phone_number: string | null
          pronouns: string | null
          rooms_joined: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          survey_completed: boolean | null
          time_in_rooms: number | null
          trial_end: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_period_end?: string | null
          current_streak?: number | null
          id: string
          is_moderator?: boolean | null
          last_activity?: string | null
          longest_streak?: number | null
          messages_posted?: number | null
          phone_number?: string | null
          pronouns?: string | null
          rooms_joined?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          survey_completed?: boolean | null
          time_in_rooms?: number | null
          trial_end?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_period_end?: string | null
          current_streak?: number | null
          id?: string
          is_moderator?: boolean | null
          last_activity?: string | null
          longest_streak?: number | null
          messages_posted?: number | null
          phone_number?: string | null
          pronouns?: string | null
          rooms_joined?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          survey_completed?: boolean | null
          time_in_rooms?: number | null
          trial_end?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      room_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_system_message: boolean
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_system_message?: boolean
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_system_message?: boolean
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_participants: {
        Row: {
          id: string
          is_creator: boolean
          is_hand_raised: boolean
          is_moderator: boolean
          is_muted: boolean
          is_speaker: boolean
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_creator?: boolean
          is_hand_raised?: boolean
          is_moderator?: boolean
          is_muted?: boolean
          is_speaker?: boolean
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_creator?: boolean
          is_hand_raised?: boolean
          is_moderator?: boolean
          is_muted?: boolean
          is_speaker?: boolean
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_room_participant_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          host_id: string
          id: string
          is_active: boolean
          name: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id?: string
          description?: string | null
          host_id: string
          id?: string
          is_active?: boolean
          name: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          host_id?: string
          id?: string
          is_active?: boolean
          name?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          biggest_challenge: string
          created_at: string
          feeling: string
          goal_frequency: string
          id: string
          journey_duration: string
          longest_streak: string
          most_rewarding: string
          motivation: string
          motivation_factors: string
          nsfw_start_age: string
          success_definition: string
          updated_at: string
          user_id: string
          virginity_status: string
        }
        Insert: {
          biggest_challenge: string
          created_at?: string
          feeling: string
          goal_frequency: string
          id?: string
          journey_duration: string
          longest_streak: string
          most_rewarding: string
          motivation: string
          motivation_factors: string
          nsfw_start_age: string
          success_definition: string
          updated_at?: string
          user_id: string
          virginity_status: string
        }
        Update: {
          biggest_challenge?: string
          created_at?: string
          feeling?: string
          goal_frequency?: string
          id?: string
          journey_duration?: string
          longest_streak?: string
          most_rewarding?: string
          motivation?: string
          motivation_factors?: string
          nsfw_start_age?: string
          success_definition?: string
          updated_at?: string
          user_id?: string
          virginity_status?: string
        }
        Relationships: []
      }
      user_clips: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          room_id: string
          room_name: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          room_id: string
          room_name: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          room_id?: string
          room_name?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_saves: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          to_user_id?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
