export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_usage: {
        Row: {
          calls: number
          day: string
          feature: string
          user_id: string
        }
        Insert: {
          calls?: number
          day?: string
          feature: string
          user_id: string
        }
        Update: {
          calls?: number
          day?: string
          feature?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          birth_day: number
          birth_month: number
          birth_year: number | null
          created_at: string
          custom_pills: string[]
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          is_gift: boolean
          name: string
          pills: Database["public"]["Enums"]["pill"][]
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_day: number
          birth_month: number
          birth_year?: number | null
          created_at?: string
          custom_pills?: string[]
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_gift?: boolean
          name: string
          pills?: Database["public"]["Enums"]["pill"][]
          updated_at?: string
          user_id?: string
        }
        Update: {
          birth_day?: number
          birth_month?: number
          birth_year?: number | null
          created_at?: string
          custom_pills?: string[]
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_gift?: boolean
          name?: string
          pills?: Database["public"]["Enums"]["pill"][]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gift_ideas_cache: {
        Row: {
          created_at: string
          ideas: string[]
          key: string
        }
        Insert: {
          created_at?: string
          ideas: string[]
          key: string
        }
        Update: {
          created_at?: string
          ideas?: string[]
          key?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          emails_enabled: boolean
          gift_lead_days: number
          id: string
          locale: Database["public"]["Enums"]["locale"] | null
          send_hour: number
          timezone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          emails_enabled?: boolean
          gift_lead_days?: number
          id: string
          locale?: Database["public"]["Enums"]["locale"] | null
          send_hour?: number
          timezone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          emails_enabled?: boolean
          gift_lead_days?: number
          id?: string
          locale?: Database["public"]["Enums"]["locale"] | null
          send_hour?: number
          timezone?: string | null
        }
        Relationships: []
      }
      reminder_log: {
        Row: {
          contact_id: string
          kind: string
          occurrence_date: string
          sent_at: string
        }
        Insert: {
          contact_id: string
          kind: string
          occurrence_date: string
          sent_at?: string
        }
        Update: {
          contact_id?: string
          kind?: string
          occurrence_date?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_log_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_ai_call: {
        Args: { p_daily_limit: number; p_feature: string; p_user_id: string }
        Returns: boolean
      }
      texts_within_length: {
        Args: { items: string[]; max_length: number }
        Returns: boolean
      }
    }
    Enums: {
      gender: "male" | "female"
      locale: "en" | "it"
      pill:
        | "nerd"
        | "gamer"
        | "tech"
        | "bookworm"
        | "fitness"
        | "sports"
        | "outdoors"
        | "traveler"
        | "foodie"
        | "coffee"
        | "wine"
        | "music"
        | "movies"
        | "art"
        | "fashion"
        | "beauty"
        | "pets"
        | "gardening"
        | "diy"
        | "wellness"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      gender: ["male", "female"],
      locale: ["en", "it"],
      pill: [
        "nerd",
        "gamer",
        "tech",
        "bookworm",
        "fitness",
        "sports",
        "outdoors",
        "traveler",
        "foodie",
        "coffee",
        "wine",
        "music",
        "movies",
        "art",
        "fashion",
        "beauty",
        "pets",
        "gardening",
        "diy",
        "wellness",
      ],
    },
  },
} as const
