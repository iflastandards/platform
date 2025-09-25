// Auto-generated Supabase database types
// Generated at: 2025-09-25T18:22:40.888Z
// Project ID not configured - using placeholder types

export type Database = {
  public: {
    Tables: {
      // Tables will be generated when Supabase project is configured
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
