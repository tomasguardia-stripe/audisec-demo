import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getState, setState } from '@/lib/store';
import { LogEntry } from '@/lib/types';

export async function POST() {
  const stripe = await getStripe();
  const state = getState();
  const logs: LogEntry[] = [];

  if (!state.setup_complete) {
    return NextResponse.json({ success: false, error: 'Setup not complete' }, { status: 400 });
  }

  try {
    const customerId = state.customers.contract2;
    const taxRateId = state.tax_rate_ids.exempt;

    // Multitenant Enterprise monthly in USD with 3 entities
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        { price: state.price_ids.mt_enterprise_monthly_usd, quantity: 1 },
        { price: state.price_ids.mt_entity_monthly_usd, quantity: 3 },
      ],
      default_tax_rates: [taxRateId],
      collection_method: 'send_invoice',
      days_until_due: 14,
      payment_settings: {
        payment_method_types: ['card'],
      },
      metadata: {
        contract_type: 'multitenant_partner',
        contract_ref: 'GS-2026-MT-002',
        country: 'MX',
        entities: '3',
      },
    });

    const totalMonthly = 2658.33 + 284.17 * 3;
    logs.push({
      timestamp: new Date().toISOString(),
      action: 'subscription.create',
      detail: `Multitenant LATAM — Enterprise + 3 entidades — ${totalMonthly.toFixed(2)} USD/mes`,
      stripe_id: subscription.id,
    });

    // Set payment methods on invoice and finalize to get hosted_invoice_url
    let hostedInvoiceUrl: string | null = null;
    const invoices = await stripe.invoices.list({ subscription: subscription.id, limit: 1 });
    if (invoices.data.length > 0) {
      let invoice = invoices.data[0];
      if (invoice.status === 'draft') {
        await stripe.invoices.update(invoice.id, {
          payment_settings: { payment_method_types: ['card'] },
        });
        invoice = await stripe.invoices.finalizeInvoice(invoice.id);
      }
      hostedInvoiceUrl = invoice.hosted_invoice_url || null;
      logs.push({
        timestamp: new Date().toISOString(),
        action: 'invoice.finalized',
        detail: `Invoice listo — ${(invoice.total / 100).toLocaleString()} USD`,
        stripe_id: invoice.id,
      });
    }

    // Switch to charge_automatically for future invoices (renewals)
    await stripe.subscriptions.update(subscription.id, {
      collection_method: 'charge_automatically',
    });

    setState({
      subscriptions: { ...state.subscriptions, contract2: subscription.id },
    });

    return NextResponse.json({
      success: true,
      subscription_id: subscription.id,
      status: subscription.status,
      hosted_invoice_url: hostedInvoiceUrl,
      items: subscription.items.data.map((item) => ({
        id: item.id,
        price_id: item.price?.id,
        quantity: item.quantity,
        amount: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        nickname: item.price?.nickname,
      })),
      logs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message, logs }, { status: 500 });
  }
}
