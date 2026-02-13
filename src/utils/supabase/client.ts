import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Create Supabase client
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionUrl: true
  }
});

// Database types
export type Database = {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          make: string;
          model: string;
          year: number;
          vin: string;
          color: string | null;
          body_type: string | null;
          odometer: number;
          auction: string;
          purchase_date: string;
          purchase_price: number;
          transport_cost: number;
          estimated_sale_price: number;
          actual_sale_price: number | null;
          status: string;
          damage_condition: string | null;
          registration_number: string | null;
          registration_expiry_date: string | null;
          images: string[];
          completion_photo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>;
      };
      costs: {
        Row: {
          id: string;
          vehicle_id: string;
          category: string;
          description: string;
          supplier: string | null;
          invoice_number: string | null;
          date: string;
          amount: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['costs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['costs']['Insert']>;
      };
      activity_logs: {
        Row: {
          id: string;
          vehicle_id: string;
          type: string;
          description: string;
          details: string | null;
          timestamp: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'timestamp'>;
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>;
      };
    };
  };
};
