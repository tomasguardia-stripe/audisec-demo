import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getState, setState } from '@/lib/store';
import { DemoState } from '@/lib/types';

export async function GET() {
  const state = getState();
  return NextResponse.json(state);
}

export async function PUT(request: NextRequest) {
  const body: DemoState = await request.json();
  if (!body.setup_complete || !body.customers || !body.price_ids) {
    return NextResponse.json({ success: false, error: 'Invalid state' }, { status: 400 });
  }
  setState(body);
  return NextResponse.json({ success: true });
}

// POST: sync subscription state from Stripe (after Checkout completes)
export async function POST(request: NextRequest) {
  const stripe = await getStripe();
  const state = getState();
  const body = await request.json();
  const { contract } = body;

  const customerId = state.customers[contract];
  if (!customerId) {
    return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 400 });
  }

  // Fetch the latest active subscription for this customer
  const subs = await stripe.subscriptions.list({ customer: customerId, limit: 1, status: 'active' });
  let subId: string | null = null;
  if (subs.data.length > 0) {
    subId = subs.data[0].id;
  } else {
    // Also check for 'incomplete' status (SEPA DD can be pending)
    const pending = await stripe.subscriptions.list({ customer: customerId, limit: 1, status: 'incomplete' });
    if (pending.data.length > 0) {
      subId = pending.data[0].id;
    }
  }

  if (subId) {
    setState({
      subscriptions: { ...state.subscriptions, [contract]: subId },
    });
    return NextResponse.json({ success: true, subscription_id: subId });
  }

  return NextResponse.json({ success: false, error: 'No subscription found' }, { status: 404 });
}
