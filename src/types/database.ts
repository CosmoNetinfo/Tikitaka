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
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          delivery_weekdays: number[]
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          delivery_weekdays?: number[]
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          delivery_weekdays?: number[]
          is_active?: boolean
        }
      }
      company_settings: {
        Row: {
          company_id: string
          order_cutoff_time: string
          monday_cutoff_on_saturday: boolean
          cancel_until_time: string
          delivery_point_text: string | null
          card_payments_enabled: boolean
          cash_payments_enabled: boolean
          card_fee_mode: 'none' | 'fixed' | 'percent'
          card_fee_value: number
          receipt_footer: string | null
          issuer_name: string | null
          issuer_vat: string | null
          issuer_address: string | null
          issuer_email: string | null
          issuer_phone: string | null
        }
        Insert: {
          company_id: string
          order_cutoff_time?: string
          monday_cutoff_on_saturday?: boolean
          cancel_until_time?: string
          delivery_point_text?: string | null
          card_payments_enabled?: boolean
          cash_payments_enabled?: boolean
          card_fee_mode?: 'none' | 'fixed' | 'percent'
          card_fee_value?: number
          receipt_footer?: string | null
          issuer_name?: string | null
          issuer_vat?: string | null
          issuer_address?: string | null
          issuer_email?: string | null
          issuer_phone?: string | null
        }
        Update: {
          company_id?: string
          order_cutoff_time?: string
          monday_cutoff_on_saturday?: boolean
          cancel_until_time?: string
          delivery_point_text?: string | null
          card_payments_enabled?: boolean
          cash_payments_enabled?: boolean
          card_fee_mode?: 'none' | 'fixed' | 'percent'
          card_fee_value?: number
          receipt_footer?: string | null
          issuer_name?: string | null
          issuer_vat?: string | null
          issuer_address?: string | null
          issuer_email?: string | null
          issuer_phone?: string | null
        }
      }
      delivery_slots: {
        Row: {
          id: string
          company_id: string | null
          label: string
          delivery_time: string
          max_orders: number | null
          sort_order: number | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          label: string
          delivery_time: string
          max_orders?: number | null
          sort_order?: number | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          company_id?: string | null
          label?: string
          delivery_time?: string
          max_orders?: number | null
          sort_order?: number | null
          is_active?: boolean | null
        }
      }
      menu_items: {
        Row: {
          id: string
          company_id: string | null
          category: 'primo_formato' | 'primo_condimento' | 'secondo' | 'contorno' | 'bibita'
          name: string
          image_url: string | null
          allergens: string | null
          price_cents: number | null
          sort_order: number | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          category: 'primo_formato' | 'primo_condimento' | 'secondo' | 'contorno' | 'bibita'
          name: string
          image_url?: string | null
          allergens?: string | null
          price_cents?: number | null
          sort_order?: number | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          company_id?: string | null
          category?: 'primo_formato' | 'primo_condimento' | 'secondo' | 'contorno' | 'bibita'
          name?: string
          image_url?: string | null
          allergens?: string | null
          price_cents?: number | null
          sort_order?: number | null
          is_active?: boolean | null
        }
      }
      combos: {
        Row: {
          id: string
          company_id: string | null
          label: string
          has_primo: boolean
          has_secondo: boolean
          has_contorno: boolean
          price_cents: number
          is_active: boolean | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          label: string
          has_primo: boolean
          has_secondo: boolean
          has_contorno: boolean
          price_cents: number
          is_active?: boolean | null
        }
        Update: {
          id?: string
          company_id?: string | null
          label?: string
          has_primo?: boolean
          has_secondo?: boolean
          has_contorno?: boolean
          price_cents?: number
          is_active?: boolean | null
        }
      }
      extras: {
        Row: {
          id: string
          company_id: string | null
          name: string
          price_cents: number
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          price_cents: number
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          price_cents?: number
        }
      }
      special_items: {
        Row: {
          id: string
          company_id: string | null
          name: string
          description: string | null
          image_url: string | null
          price_cents: number
          includes_water: boolean
          available_dates: string[]
          is_active: boolean | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          description?: string | null
          image_url?: string | null
          price_cents: number
          includes_water?: boolean
          available_dates: string[]
          is_active?: boolean | null
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          description?: string | null
          image_url?: string | null
          price_cents?: number
          includes_water?: boolean
          available_dates?: string[]
          is_active?: boolean | null
        }
      }
      closed_days: {
        Row: {
          company_id: string
          day: string
          reason: string | null
        }
        Insert: {
          company_id: string
          day: string
          reason?: string | null
        }
        Update: {
          company_id?: string
          day?: string
          reason?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: number
          public_code: string
          client_token: string
          company_id: string
          delivery_date: string
          slot_id: string
          customer_first_name: string
          customer_last_name: string
          notes: string | null
          combo_id: string | null
          primo_formato: string | null
          primo_condimento: string | null
          secondo: string | null
          contorno: string | null
          drink: string | null
          subtotal_cents: number
          card_fee_cents: number
          total_cents: number
          payment_method: 'card' | 'cash'
          payment_status: 'pending_payment' | 'paid' | 'cash_pending' | 'cash_received' | 'unpaid' | 'refunded'
          status: 'active' | 'cancelled'
          cancelled_at: string | null
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_number?: number
          public_code: string
          client_token: string
          company_id: string
          delivery_date: string
          slot_id: string
          customer_first_name: string
          customer_last_name: string
          notes?: string | null
          combo_id?: string | null
          primo_formato?: string | null
          primo_condimento?: string | null
          secondo?: string | null
          contorno?: string | null
          drink?: string | null
          subtotal_cents: number
          card_fee_cents?: number
          total_cents: number
          payment_method: 'card' | 'cash'
          payment_status: 'pending_payment' | 'paid' | 'cash_pending' | 'cash_received' | 'unpaid' | 'refunded'
          status?: 'active' | 'cancelled'
          cancelled_at?: string | null
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_number?: number
          public_code?: string
          client_token?: string
          company_id?: string
          delivery_date?: string
          slot_id?: string
          customer_first_name?: string
          customer_last_name?: string
          notes?: string | null
          combo_id?: string | null
          primo_formato?: string | null
          primo_condimento?: string | null
          secondo?: string | null
          contorno?: string | null
          drink?: string | null
          subtotal_cents?: number
          card_fee_cents?: number
          total_cents?: number
          payment_method?: 'card' | 'cash'
          payment_status?: 'pending_payment' | 'paid' | 'cash_pending' | 'cash_received' | 'unpaid' | 'refunded'
          status?: 'active' | 'cancelled'
          cancelled_at?: string | null
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      order_lines: {
        Row: {
          id: string
          order_id: string | null
          special_item_id: string | null
          name_snapshot: string
          unit_price_cents: number
          qty: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          special_item_id?: string | null
          name_snapshot: string
          unit_price_cents: number
          qty?: number
        }
        Update: {
          id?: string
          order_id?: string | null
          special_item_id?: string | null
          name_snapshot?: string
          unit_price_cents?: number
          qty?: number
        }
      }
      admins: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export type OrderWithDetails = Tables<'orders'> & {
  company: Tables<'companies'>
  slot: Tables<'delivery_slots'>
  combo: Tables<'combos'> | null
  order_lines: Tables<'order_lines'>[]
}
