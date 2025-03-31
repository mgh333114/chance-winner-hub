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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
