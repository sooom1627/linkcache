export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      collection_links: {
        Row: {
          collection_id: string;
          link_id: string;
        };
        Insert: {
          collection_id: string;
          link_id: string;
        };
        Update: {
          collection_id?: string;
          link_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_links_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_links_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_links_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "user_links_view";
            referencedColumns: ["link_id"];
          },
        ];
      };
      collections: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      link_status: {
        Row: {
          created_at: string | null;
          id: string;
          link_id: string;
          read_at: string | null;
          status: Database["public"]["Enums"]["triage_status"] | null;
          triaged_at: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          link_id: string;
          read_at?: string | null;
          status?: Database["public"]["Enums"]["triage_status"] | null;
          triaged_at?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          link_id?: string;
          read_at?: string | null;
          status?: Database["public"]["Enums"]["triage_status"] | null;
          triaged_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "link_status_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "link_status_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "user_links_view";
            referencedColumns: ["link_id"];
          },
          {
            foreignKeyName: "link_status_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      links: {
        Row: {
          created_at: string | null;
          description: string | null;
          favicon_url: string | null;
          id: string;
          image_url: string | null;
          site_name: string | null;
          title: string | null;
          updated_at: string | null;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          favicon_url?: string | null;
          id?: string;
          image_url?: string | null;
          site_name?: string | null;
          title?: string | null;
          updated_at?: string | null;
          url: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          favicon_url?: string | null;
          id?: string;
          image_url?: string | null;
          site_name?: string | null;
          title?: string | null;
          updated_at?: string | null;
          url?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          updated_at: string | null;
          user_id: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          updated_at?: string | null;
          user_id: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      user_links_view: {
        Row: {
          description: string | null;
          favicon_url: string | null;
          image_url: string | null;
          link_created_at: string | null;
          link_id: string | null;
          read_at: string | null;
          site_name: string | null;
          status: Database["public"]["Enums"]["triage_status"] | null;
          status_id: string | null;
          title: string | null;
          triaged_at: string | null;
          url: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "link_status_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      create_link_with_status: {
        Args: {
          p_description?: string;
          p_favicon_url?: string;
          p_image_url?: string;
          p_site_name?: string;
          p_title?: string;
          p_url: string;
        };
        Returns: Json;
      };
      get_user_links: {
        Args: { p_page?: number; p_page_size?: number };
        Returns: Json;
      };
    };
    Enums: {
      triage_status: "new" | "read_soon" | "stock" | "done";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  TTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TTableName extends TTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[TTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[TTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = TTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[TTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[TTableNameOrOptions["schema"]]["Views"])[TTableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : TTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[TTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  TTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TTableName extends TTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[TTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = TTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[TTableNameOrOptions["schema"]]["Tables"][TTableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : TTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][TTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  TTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TTableName extends TTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[TTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = TTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[TTableNameOrOptions["schema"]]["Tables"][TTableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : TTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][TTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  TEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  TEnumName extends TEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[TEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = TEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[TEnumNameOrOptions["schema"]]["Enums"][TEnumName]
  : TEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][TEnumNameOrOptions]
    : never;

export type CompositeTypes<
  TCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  TCompositeTypeName extends TCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[TCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = TCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[TCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][TCompositeTypeName]
  : TCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][TCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      triage_status: ["new", "read_soon", "stock", "done"],
    },
  },
} as const;
