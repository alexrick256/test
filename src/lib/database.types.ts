// Handgepflegte Typen passend zu supabase/schema.sql.
// Bei Schemaänderungen bitte synchron halten (oder via `supabase gen types` ersetzen).

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          email: string | null;
          full_name: string | null;
          onboarding_completed_at: string | null;
          currency: string;
          created_at: string;
        },
        {
          id: string;
          email?: string | null;
          full_name?: string | null;
          onboarding_completed_at?: string | null;
          currency?: string;
          created_at?: string;
        }
      >;
      subscriptions: Table<
        {
          id: string;
          user_id: string;
          plan: "free" | "pro" | "max";
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          plan?: "free" | "pro" | "max";
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      plan_years: Table<
        { id: string; user_id: string; year: number; created_at: string },
        { id?: string; user_id: string; year: number; created_at?: string }
      >;
      income_values: Table<
        { id: string; user_id: string; year: number; month: number; amount: number; updated_at: string },
        {
          id?: string;
          user_id: string;
          year: number;
          month: number;
          amount: number;
          updated_at?: string;
        }
      >;
      fixed_cost_categories: Table<
        { id: string; user_id: string; name: string; sort_order: number; archived: boolean; created_at: string },
        {
          id?: string;
          user_id: string;
          name: string;
          sort_order?: number;
          archived?: boolean;
          created_at?: string;
        }
      >;
      fixed_cost_values: Table<
        { id: string; category_id: string; year: number; month: number; amount: number; updated_at: string },
        {
          id?: string;
          category_id: string;
          year: number;
          month: number;
          amount: number;
          updated_at?: string;
        }
      >;
      savings_pockets: Table<
        { id: string; user_id: string; name: string; sort_order: number; archived: boolean; created_at: string },
        {
          id?: string;
          user_id: string;
          name: string;
          sort_order?: number;
          archived?: boolean;
          created_at?: string;
        }
      >;
      savings_pocket_values: Table<
        { id: string; pocket_id: string; year: number; month: number; amount: number; updated_at: string },
        {
          id?: string;
          pocket_id: string;
          year: number;
          month: number;
          amount: number;
          updated_at?: string;
        }
      >;
      capital_transactions: Table<
        {
          id: string;
          user_id: string;
          type: "deposit" | "allocation";
          amount: number;
          pocket_id: string | null;
          recurring_allocation_id: string | null;
          occurred_at: string;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          type: "deposit" | "allocation";
          amount: number;
          pocket_id?: string | null;
          recurring_allocation_id?: string | null;
          occurred_at?: string;
          created_at?: string;
        }
      >;
      capital_recurring_allocations: Table<
        {
          id: string;
          user_id: string;
          pocket_id: string;
          amount: number;
          status: "active" | "paused";
          last_applied_year: number | null;
          last_applied_month: number | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          pocket_id: string;
          amount: number;
          status?: "active" | "paused";
          last_applied_year?: number | null;
          last_applied_month?: number | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      allocate_capital_to_pocket: {
        Args: { p_pocket_id: string; p_amount: number; p_year: number; p_month: number };
        Returns: number;
      };
      apply_due_recurring_capital_allocations: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
