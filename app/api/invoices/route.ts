import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getState } from '@/lib/store';

export async function GET(request: NextRequest) {
  const stripe = await getStripe();
  const state = getState();

  if (!state.setup_complete) {
    return NextResponse.json({ success: false, error: 'Setup not complete' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const contract = searchParams.get('contract');

    // If a specific contract is requested, filter by customer
    const customerId = contract ? state.customers[contract] : undefined;

    const params: Parameters<typeof stripe.invoices.list>[0] = {
      limit: 20,
    };
    if (customerId) {
      params.customer = customerId;
    }

    const invoices = await stripe.invoices.list(params);

    const formatted = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      customer_name: inv.customer_name,
      status: inv.status,
      amount_due: inv.amount_due / 100,
      amount_paid: inv.amount_paid / 100,
      currency: inv.currency,
      created: new Date(inv.created * 1000).toISOString(),
      period_start: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
      period_end: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
      lines: inv.lines.data.map((line) => ({
        description: line.description,
        amount: line.amount / 100,
        quantity: line.quantity,
        period: line.period
          ? {
              start: new Date(line.period.start * 1000).toISOString(),
              end: new Date(line.period.end * 1000).toISOString(),
            }
          : null,
      })),
      tax: (inv.total - inv.subtotal) / 100,
      total: inv.total / 100,
      custom_fields: inv.custom_fields,
    }));

    return NextResponse.json({ success: true, invoices: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
