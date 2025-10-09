export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          title: string | null
          avatar_url: string | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          title?: string | null
          avatar_url?: string | null
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          title?: string | null
          avatar_url?: string | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      social_links: {
        Row: {
          id: string
          user_id: string
          platform: string
          display_name: string
          url: string
          color: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          display_name: string
          url: string
          color?: string
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          display_name?: string
          url?: string
          color?: string
          order?: number
          created_at?: string
        }
      }
      custom_buttons: {
        Row: {
          id: string
          user_id: string
          title: string
          subtitle: string | null
          url: string
          icon: string | null
          link_type: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          subtitle?: string | null
          url: string
          icon?: string | null
          link_type?: string
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          subtitle?: string | null
          url?: string
          icon?: string | null
          link_type?: string
          order?: number
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          whatsapp: string
          selected_material_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          whatsapp: string
          selected_material_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          whatsapp?: string
          selected_material_id?: string | null
          created_at?: string
        }
      }
      free_materials: {
        Row: {
          id: string
          user_id: string
          material_name: string
          webhook_url: string
          email_content: string
          thank_you_content: string
          is_active: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          material_name: string
          webhook_url: string
          email_content: string
          thank_you_content: string
          is_active?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          material_name?: string
          webhook_url?: string
          email_content?: string
          thank_you_content?: string
          is_active?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          user_id: string
          image_url: string | null
          video_url: string | null
          title: string | null
          link_url: string | null
          order: number
          duration: number
          created_at: string
          expires_at: string
          is_active: boolean
          views_count: number
          clicks_count: number
        }
        Insert: {
          id?: string
          user_id: string
          image_url?: string | null
          video_url?: string | null
          title?: string | null
          link_url?: string | null
          order?: number
          duration?: number
          created_at?: string
          expires_at?: string
          is_active?: boolean
          views_count?: number
          clicks_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string | null
          video_url?: string | null
          title?: string | null
          link_url?: string | null
          order?: number
          duration?: number
          created_at?: string
          expires_at?: string
          is_active?: boolean
          views_count?: number
          clicks_count?: number
        }
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewer_session: string
          viewed_at: string
        }
        Insert: {
          id?: string
          story_id: string
          viewer_session: string
          viewed_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          viewer_session?: string
          viewed_at?: string
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type SocialLink = Database['public']['Tables']['social_links']['Row']
export type CustomButton = Database['public']['Tables']['custom_buttons']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Story = Database['public']['Tables']['stories']['Row']
export type StoryView = Database['public']['Tables']['story_views']['Row']
export type FreeMaterial = Database['public']['Tables']['free_materials']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type SocialLinkInsert = Database['public']['Tables']['social_links']['Insert']
export type CustomButtonInsert = Database['public']['Tables']['custom_buttons']['Insert']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
export type StoryViewInsert = Database['public']['Tables']['story_views']['Insert']
export type FreeMaterialInsert = Database['public']['Tables']['free_materials']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type SocialLinkUpdate = Database['public']['Tables']['social_links']['Update']
export type CustomButtonUpdate = Database['public']['Tables']['custom_buttons']['Update']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']
export type StoryUpdate = Database['public']['Tables']['stories']['Update']
export type StoryViewUpdate = Database['public']['Tables']['story_views']['Update']
export type FreeMaterialUpdate = Database['public']['Tables']['free_materials']['Update']

