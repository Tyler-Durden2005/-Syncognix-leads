/**
 * Hand-written Supabase schema types. Regenerate with
 * `npx supabase gen types typescript --project-id <id> > src/types/database.ts`
 * once the schema grows.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          user_id: string
          osm_id: string
          osm_type: "node" | "way" | "relation"
          name: string
          website: string | null
          phone: string | null
          street: string | null
          city: string | null
          state: string | null
          postcode: string | null
          address: string | null
          category: string
          latitude: number | null
          longitude: number | null
          search_business_type: string | null
          search_location: string | null
          status: LeadStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          osm_id: string
          osm_type: "node" | "way" | "relation"
          name: string
          website?: string | null
          phone?: string | null
          street?: string | null
          city?: string | null
          state?: string | null
          postcode?: string | null
          address?: string | null
          category: string
          latitude?: number | null
          longitude?: number | null
          search_business_type?: string | null
          search_location?: string | null
          status?: LeadStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          website?: string | null
          phone?: string | null
          street?: string | null
          city?: string | null
          state?: string | null
          postcode?: string | null
          address?: string | null
          status?: LeadStatus
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type LeadStatus = "new" | "contacted" | "replied" | "qualified" | "archived"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Lead = Database["public"]["Tables"]["leads"]["Row"]
