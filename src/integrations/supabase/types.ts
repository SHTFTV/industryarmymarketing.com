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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          city: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          source: string
          trade: string
          user_agent: string | null
        }
        Insert: {
          city: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          source?: string
          trade: string
          user_agent?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          source?: string
          trade?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      proposal_email_attempts: {
        Row: {
          created_at: string
          error: string | null
          id: string
          kind: string
          message_id: string | null
          proposal_id: string
          recipient: string
          status: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          kind: string
          message_id?: string | null
          proposal_id: string
          recipient: string
          status: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          message_id?: string | null
          proposal_id?: string
          recipient?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_email_attempts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "seo_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_audits: {
        Row: {
          checks: Json
          created_at: string
          deep_dive: Json | null
          id: string
          meta: Json
          score: number
          status: number | null
          ttfb: number | null
          url: string
          user_id: string
        }
        Insert: {
          checks?: Json
          created_at?: string
          deep_dive?: Json | null
          id?: string
          meta?: Json
          score?: number
          status?: number | null
          ttfb?: number | null
          url: string
          user_id: string
        }
        Update: {
          checks?: Json
          created_at?: string
          deep_dive?: Json | null
          id?: string
          meta?: Json
          score?: number
          status?: number | null
          ttfb?: number | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_events: {
        Row: {
          created_at: string
          event: string
          id: string
          meta: Json
          package_slug: string | null
          path: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          meta?: Json
          package_slug?: string | null
          path?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          meta?: Json
          package_slug?: string | null
          path?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      seo_proposals: {
        Row: {
          budget: number
          city_population: number
          competition: string
          created_at: string
          customer_email_error: string | null
          customer_email_status: string
          customer_message_id: string | null
          email: string | null
          email_attempted_at: string | null
          emailed_customer: boolean
          emailed_owner: boolean
          id: string
          keywords: string | null
          name: string | null
          notes: string | null
          owner_email_error: string | null
          owner_email_status: string
          owner_message_id: string | null
          package_price: number
          package_slug: string
          referrer: string | null
          source: string
          status: string
          target_url: string | null
          target_urls: number
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          budget?: number
          city_population?: number
          competition?: string
          created_at?: string
          customer_email_error?: string | null
          customer_email_status?: string
          customer_message_id?: string | null
          email?: string | null
          email_attempted_at?: string | null
          emailed_customer?: boolean
          emailed_owner?: boolean
          id?: string
          keywords?: string | null
          name?: string | null
          notes?: string | null
          owner_email_error?: string | null
          owner_email_status?: string
          owner_message_id?: string | null
          package_price?: number
          package_slug: string
          referrer?: string | null
          source?: string
          status?: string
          target_url?: string | null
          target_urls?: number
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          budget?: number
          city_population?: number
          competition?: string
          created_at?: string
          customer_email_error?: string | null
          customer_email_status?: string
          customer_message_id?: string | null
          email?: string | null
          email_attempted_at?: string | null
          emailed_customer?: boolean
          emailed_owner?: boolean
          id?: string
          keywords?: string | null
          name?: string | null
          notes?: string | null
          owner_email_error?: string | null
          owner_email_status?: string
          owner_message_id?: string | null
          package_price?: number
          package_slug?: string
          referrer?: string | null
          source?: string
          status?: string
          target_url?: string | null
          target_urls?: number
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_trade_preferences: {
        Row: {
          industry: string
          trade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          industry?: string
          trade?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          industry?: string
          trade?: string
          updated_at?: string
          user_id?: string
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
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
