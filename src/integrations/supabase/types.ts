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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_audit: {
        Row: {
          checks_json: Json | null
          created_at: string | null
          id: number
          listing_id: string | null
          notes: string | null
          passed: boolean | null
        }
        Insert: {
          checks_json?: Json | null
          created_at?: string | null
          id?: number
          listing_id?: string | null
          notes?: string | null
          passed?: boolean | null
        }
        Update: {
          checks_json?: Json | null
          created_at?: string | null
          id?: number
          listing_id?: string | null
          notes?: string | null
          passed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_audit_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      enrichment: {
        Row: {
          disclaimers_json: Json | null
          generated_at: string | null
          heritage_json: Json | null
          listing_id: string
          planning_overlays_json: Json | null
          pois_json: Json | null
          ptv_json: Json | null
          schools_json: Json | null
          suburb_medians_json: Json | null
        }
        Insert: {
          disclaimers_json?: Json | null
          generated_at?: string | null
          heritage_json?: Json | null
          listing_id: string
          planning_overlays_json?: Json | null
          pois_json?: Json | null
          ptv_json?: Json | null
          schools_json?: Json | null
          suburb_medians_json?: Json | null
        }
        Update: {
          disclaimers_json?: Json | null
          generated_at?: string | null
          heritage_json?: Json | null
          listing_id?: string
          planning_overlays_json?: Json | null
          pois_json?: Json | null
          ptv_json?: Json | null
          schools_json?: Json | null
          suburb_medians_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "enrichment_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      fetch_cache: {
        Row: {
          cache_key: string
          etag: string | null
          expires_at: string | null
          payload_json: Json | null
        }
        Insert: {
          cache_key: string
          etag?: string | null
          expires_at?: string | null
          payload_json?: Json | null
        }
        Update: {
          cache_key?: string
          etag?: string | null
          expires_at?: string | null
          payload_json?: Json | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          listing_id: string | null
          name: string | null
          phone: string | null
          source: string | null
          utm_json: Json | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: number
          listing_id?: string | null
          name?: string | null
          phone?: string | null
          source?: string | null
          utm_json?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          listing_id?: string | null
          name?: string | null
          phone?: string | null
          source?: string | null
          utm_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_media: {
        Row: {
          created_at: string | null
          id: number
          kind: string | null
          listing_id: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          kind?: string | null
          listing_id?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: number
          kind?: string | null
          listing_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_media_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address_line: string
          baths: number | null
          beds: number | null
          cars: number | null
          created_at: string | null
          created_by: string | null
          id: string
          land_size_sqm: number | null
          lat: number | null
          lng: number | null
          postcode: string
          price_guide_text: string | null
          property_type: string | null
          soi_url: string | null
          state: string
          status: string | null
          suburb: string
          updated_at: string | null
        }
        Insert: {
          address_line: string
          baths?: number | null
          beds?: number | null
          cars?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          land_size_sqm?: number | null
          lat?: number | null
          lng?: number | null
          postcode: string
          price_guide_text?: string | null
          property_type?: string | null
          soi_url?: string | null
          state?: string
          status?: string | null
          suburb: string
          updated_at?: string | null
        }
        Update: {
          address_line?: string
          baths?: number | null
          beds?: number | null
          cars?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          land_size_sqm?: number | null
          lat?: number | null
          lng?: number | null
          postcode?: string
          price_guide_text?: string | null
          property_type?: string | null
          soi_url?: string | null
          state?: string
          status?: string | null
          suburb?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      property_packs: {
        Row: {
          generated_at: string | null
          id: number
          listing_id: string | null
          pdf_url: string | null
          version: number | null
        }
        Insert: {
          generated_at?: string | null
          id?: number
          listing_id?: string | null
          pdf_url?: string | null
          version?: number | null
        }
        Update: {
          generated_at?: string | null
          id?: number
          listing_id?: string | null
          pdf_url?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_packs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvps: {
        Row: {
          contact: string | null
          created_at: string | null
          full_name: string | null
          id: number
          listing_id: string | null
          notes: string | null
          session_time: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: number
          listing_id?: string | null
          notes?: string | null
          session_time?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: number
          listing_id?: string | null
          notes?: string | null
          session_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          id: number
          lat: number | null
          level: string | null
          lng: number | null
          name: string
          postcode: string | null
          sector: string | null
          suburb: string | null
        }
        Insert: {
          address?: string | null
          id?: number
          lat?: number | null
          level?: string | null
          lng?: number | null
          name: string
          postcode?: string | null
          sector?: string | null
          suburb?: string | null
        }
        Update: {
          address?: string | null
          id?: number
          lat?: number | null
          level?: string | null
          lng?: number | null
          name?: string
          postcode?: string | null
          sector?: string | null
          suburb?: string | null
        }
        Relationships: []
      }
      social_assets: {
        Row: {
          created_at: string | null
          id: number
          listing_id: string | null
          payload_json: Json
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          listing_id?: string | null
          payload_json: Json
          status?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: number
          listing_id?: string | null
          payload_json?: Json
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_assets_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      suburbs: {
        Row: {
          lga: string | null
          name: string
          stats_json: Json | null
          updated_at: string | null
        }
        Insert: {
          lga?: string | null
          name: string
          stats_json?: Json | null
          updated_at?: string | null
        }
        Update: {
          lga?: string | null
          name?: string
          stats_json?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vgv_medians: {
        Row: {
          id: number
          median_price: number | null
          property_type: string
          sales_count: number | null
          suburb: string
          year: number
        }
        Insert: {
          id?: number
          median_price?: number | null
          property_type: string
          sales_count?: number | null
          suburb: string
          year: number
        }
        Update: {
          id?: number
          median_price?: number | null
          property_type?: string
          sales_count?: number | null
          suburb?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: { _roles: string[]; _user_id: string }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
