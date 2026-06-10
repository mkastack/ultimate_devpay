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
      activities: {
        Row: {
          created_at: string
          id: string
          subtitle: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subtitle?: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subtitle?: string
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          agreed_usd: number
          client_id: string
          client_name: string
          client_verified: boolean
          created_at: string
          current_milestone_label: string
          developer_id: string
          escrow_usd: number
          id: string
          job_id: string | null
          milestone_current: number
          milestone_total: number
          status: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at: string
        }
        Insert: {
          agreed_usd?: number
          client_id: string
          client_name: string
          client_verified?: boolean
          created_at?: string
          current_milestone_label?: string
          developer_id: string
          escrow_usd?: number
          id?: string
          job_id?: string | null
          milestone_current?: number
          milestone_total?: number
          status?: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at?: string
        }
        Update: {
          agreed_usd?: number
          client_id?: string
          client_name?: string
          client_verified?: boolean
          created_at?: string
          current_milestone_label?: string
          developer_id?: string
          escrow_usd?: number
          id?: string
          job_id?: string | null
          milestone_current?: number
          milestone_total?: number
          status?: Database["public"]["Enums"]["contract_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          client_id: string
          client_name: string
          contract_active: boolean
          created_at: string
          developer_id: string
          id: string
          last_message: string
          last_message_at: string
          unread_for_developer: boolean
        }
        Insert: {
          client_id: string
          client_name: string
          contract_active?: boolean
          created_at?: string
          developer_id: string
          id?: string
          last_message?: string
          last_message_at?: string
          unread_for_developer?: boolean
        }
        Update: {
          client_id?: string
          client_name?: string
          contract_active?: boolean
          created_at?: string
          developer_id?: string
          id?: string
          last_message?: string
          last_message_at?: string
          unread_for_developer?: boolean
        }
        Relationships: []
      }
      job_skills: {
        Row: {
          job_id: string
          skill_id: string
        }
        Insert: {
          job_id: string
          skill_id: string
        }
        Update: {
          job_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          budget_max_usd: number
          budget_min_usd: number
          category: string
          client_id: string
          client_name: string
          client_verified: boolean
          created_at: string
          description: string
          duration_label: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          proposals_count: number
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget_max_usd?: number
          budget_min_usd?: number
          category?: string
          client_id: string
          client_name: string
          client_verified?: boolean
          created_at?: string
          description?: string
          duration_label?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          proposals_count?: number
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget_max_usd?: number
          budget_min_usd?: number
          category?: string
          client_id?: string
          client_name?: string
          client_verified?: boolean
          created_at?: string
          description?: string
          duration_label?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          proposals_count?: number
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_skill_score: number
          availability: Database["public"]["Enums"]["availability_status"]
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          full_name: string
          headline: string
          id: string
          is_verified: boolean
          jobs_completed: number
          proposals_limit: number
          proposals_used: number
          rating: number
          rating_count: number
          response_rate: number
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
          username: string
        }
        Insert: {
          ai_skill_score?: number
          availability?: Database["public"]["Enums"]["availability_status"]
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string
          headline?: string
          id: string
          is_verified?: boolean
          jobs_completed?: number
          proposals_limit?: number
          proposals_used?: number
          rating?: number
          rating_count?: number
          response_rate?: number
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          username: string
        }
        Update: {
          ai_skill_score?: number
          availability?: Database["public"]["Enums"]["availability_status"]
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string
          headline?: string
          id?: string
          is_verified?: boolean
          jobs_completed?: number
          proposals_limit?: number
          proposals_used?: number
          rating?: number
          rating_count?: number
          response_rate?: number
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          bid_usd: number
          cover_letter: string
          created_at: string
          days: number
          developer_id: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["proposal_status"]
          updated_at: string
          viewed_by_client: boolean
        }
        Insert: {
          bid_usd: number
          cover_letter?: string
          created_at?: string
          days: number
          developer_id: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
          viewed_by_client?: boolean
        }
        Update: {
          bid_usd?: number
          cover_letter?: string
          created_at?: string
          days?: number
          developer_id?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
          viewed_by_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "proposals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
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
      user_skills: {
        Row: {
          proficiency: number
          skill_id: string
          user_id: string
        }
        Insert: {
          proficiency?: number
          skill_id: string
          user_id: string
        }
        Update: {
          proficiency?: number
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount_usd: number
          contract_id: string | null
          created_at: string
          description: string
          id: string
          status: Database["public"]["Enums"]["txn_status"]
          type: Database["public"]["Enums"]["txn_type"]
          user_id: string
        }
        Insert: {
          amount_usd: number
          contract_id?: string | null
          created_at?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["txn_status"]
          type: Database["public"]["Enums"]["txn_type"]
          user_id: string
        }
        Update: {
          amount_usd?: number
          contract_id?: string | null
          created_at?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["txn_status"]
          type?: Database["public"]["Enums"]["txn_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type: "proposal" | "payment" | "contract" | "message" | "review"
      app_role: "admin" | "moderator" | "user"
      availability_status: "available" | "busy" | "not_available"
      contract_status: "active" | "completed" | "disputed" | "paused"
      experience_level: "entry" | "intermediate" | "expert"
      job_status: "open" | "in_review" | "awarded" | "closed"
      proposal_status: "pending" | "accepted" | "rejected" | "withdrawn"
      subscription_plan: "free" | "pro"
      txn_status: "pending" | "completed" | "failed"
      txn_type:
        | "deposit"
        | "escrow_hold"
        | "escrow_release"
        | "payout"
        | "fee"
        | "refund"
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
      activity_type: ["proposal", "payment", "contract", "message", "review"],
      app_role: ["admin", "moderator", "user"],
      availability_status: ["available", "busy", "not_available"],
      contract_status: ["active", "completed", "disputed", "paused"],
      experience_level: ["entry", "intermediate", "expert"],
      job_status: ["open", "in_review", "awarded", "closed"],
      proposal_status: ["pending", "accepted", "rejected", "withdrawn"],
      subscription_plan: ["free", "pro"],
      txn_status: ["pending", "completed", "failed"],
      txn_type: [
        "deposit",
        "escrow_hold",
        "escrow_release",
        "payout",
        "fee",
        "refund",
      ],
    },
  },
} as const
