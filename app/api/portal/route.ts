import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getState } from '@/lib/store';
import { getBaseUrl } from '@/lib/url';
import { LogEntry } from '@/lib/types';

export async function POST(request: NextRequest) {
  const stripe = await getStripe();
  const state = getState();
  const logs: LogEntry[] = [];

  if (!state.setup_complete) {
    return NextResponse.json({ success: false, error: 'Ejecuta Setup primero' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { customer_key } = body;

    const customerId = state.customers[customer_key];
    if (!customerId) {
      return NextResponse.json({ success: false, error: `Customer ${customer_key} not found` }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getBaseUrl(request)}/portal`,
    });

    logs.push({
      timestamp: new Date().toISOString(),
      action: 'portal.session.create',
      detail: `Sesión de portal abierta para ${customer_key}`,
      stripe_id: session.id,
    });

    return NextResponse.json({ success: true, url: session.url, logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message, logs }, { status: 500 });
  }
}
