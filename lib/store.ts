import { DemoState } from './types';

const emptyState: DemoState = {
  setup_complete: false,
  product_ids: {},
  price_ids: {},
  tax_rate_ids: {},
  coupon_ids: {},
  test_clocks: {},
  customers: {},
  payment_methods: {},
  subscriptions: {
    contract1: null,
    contract2: null,
    contract3: null,
    contract4: null,
  },
  schedule_id: null,
  portal_config_id: null,
};

let state: DemoState = { ...emptyState };

export function getState(): DemoState {
  return state;
}

export function setState(newState: Partial<DemoState>) {
  state = { ...state, ...newState };
}

export function resetState() {
  state = { ...emptyState };
}
