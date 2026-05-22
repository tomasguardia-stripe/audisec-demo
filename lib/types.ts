export interface DemoState {
  setup_complete: boolean;
  product_ids: Record<string, string>;
  price_ids: Record<string, string>;
  tax_rate_ids: Record<string, string>;
  coupon_ids: Record<string, string>;
  test_clocks: Record<string, string>;
  customers: Record<string, string>;
  payment_methods: Record<string, string>;
  subscriptions: Record<string, string | null>;
  schedule_id: string | null;
  portal_config_id: string | null;
}

export interface LogEntry {
  timestamp: string;
  action: string;
  detail: string;
  stripe_id?: string;
}
