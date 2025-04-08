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
      draws: {
        Row: {
          created_at: string
          draw_date: string
          id: string
          jackpot: number
          status: string
          updated_at: string
          winning_numbers: number[]
        }
        Insert: {
          created_at?: string
          draw_date: string
          id?: string
          jackpot: number
          status?: string
          updated_at?: string
          winning_numbers: number[]
        }
        Update: {
          created_at?: string
          draw_date?: string
          id?: string
          jackpot?: number
          status?: string
          updated_at?: string
          winning_numbers?: number[]
        }
        Relationships: []
      }
      lottery_news: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          created_at: string
          email: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          account_type?: string | null
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          account_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referred_id: string | null
          referrer_id: string
          reward_claimed: boolean | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id: string
          reward_claimed?: boolean | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string
          reward_claimed?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          details: Json | null
          expires_at: string | null
          id: string
          is_claimed: boolean | null
          is_expired: boolean | null
          reward_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          details?: Json | null
          expires_at?: string | null
          id?: string
          is_claimed?: boolean | null
          is_expired?: boolean | null
          reward_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          details?: Json | null
          expires_at?: string | null
          id?: string
          is_claimed?: boolean | null
          is_expired?: boolean | null
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          last_reply_at: string | null
          last_reply_by: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          last_reply_at?: string | null
          last_reply_by?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          last_reply_at?: string | null
          last_reply_by?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      syndicate_members: {
        Row: {
          contribution_percentage: number
          id: string
          joined_at: string
          syndicate_id: string
          user_id: string
        }
        Insert: {
          contribution_percentage?: number
          id?: string
          joined_at?: string
          syndicate_id: string
          user_id: string
        }
        Update: {
          contribution_percentage?: number
          id?: string
          joined_at?: string
          syndicate_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndicate_members_syndicate_id_fkey"
            columns: ["syndicate_id"]
            isOneToOne: false
            referencedRelation: "syndicates"
            referencedColumns: ["id"]
          },
        ]
      }
      syndicates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_members: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_members?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_members?: number
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          draw_date: string
          id: string
          numbers: number[]
          price: number
          prize: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draw_date: string
          id?: string
          numbers: number[]
          price?: number
          prize?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draw_date?: string
          id?: string
          numbers?: number[]
          price?: number
          prize?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          details: Json | null
          id: string
          is_demo: boolean | null
          payment_intent_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          details?: Json | null
          id?: string
          is_demo?: boolean | null
          payment_intent_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          details?: Json | null
          id?: string
          is_demo?: boolean | null
          payment_intent_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          account_changes: boolean | null
          draw_results: boolean | null
          promotions: boolean | null
          syndicate_updates: boolean | null
          ticket_purchases: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_changes?: boolean | null
          draw_results?: boolean | null
          promotions?: boolean | null
          syndicate_updates?: boolean | null
          ticket_purchases?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_changes?: boolean | null
          draw_results?: boolean | null
          promotions?: boolean | null
          syndicate_updates?: boolean | null
          ticket_purchases?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_default: boolean | null
          last_four: string | null
          metadata: Json | null
          provider: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          metadata?: Json | null
          provider: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          metadata?: Json | null
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      user_vip_status: {
        Row: {
          last_calculated_at: string | null
          points: number
          tier_id: number
          user_id: string
        }
        Insert: {
          last_calculated_at?: string | null
          points?: number
          tier_id?: number
          user_id: string
        }
        Update: {
          last_calculated_at?: string | null
          points?: number
          tier_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_vip_status_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "vip_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_tiers: {
        Row: {
          cashback_percentage: number
          description: string | null
          id: number
          name: string
          required_points: number
          weekly_bonus: number
        }
        Insert: {
          cashback_percentage: number
          description?: string | null
          id?: number
          name: string
          required_points: number
          weekly_bonus: number
        }
        Update: {
          cashback_percentage?: number
          description?: string | null
          id?: number
          name?: string
          required_points?: number
          weekly_bonus?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_demo_transaction: {
        Args: {
          user_id_input: string
          amount_input: number
          type_input: string
          details_input: Json
        }
        Returns: boolean
      }
      process_demo_withdrawal: {
        Args: {
          user_id_input: string
          amount_input: number
          type_input: string
          details_input: Json
        }
        Returns: boolean
      }
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
