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
    const customerId = state.customers.contract3;
    const taxRateId = state.tax_rate_ids.reverse_charge;

    // Multi-year ramp-up using Subscription Schedule (3 phases)
    // Bank Transfer: send_invoice + customer_balance (Stripe creates VBAN)
    const schedule = await stripe.subscriptionSchedules.create({
      customer: customerId,
      start_date: 'now',
      end_behavior: 'cancel',
      default_settings: {
        collection_method: 'send_invoice',
        invoice_settings: { days_until_due: 14 },
      },
      phases: [
        {
          items: [{ price: state.price_ids.plus_year1 }],
          duration: { interval: 'year', interval_count: 1 },
          default_tax_rates: [taxRateId],
          metadata: { contract_year: '1', amount: '25000' },
        },
        {
          items: [{ price: state.price_ids.plus_year2 }],
          duration: { interval: 'year', interval_count: 1 },
          default_tax_rates: [taxRateId],
          metadata: { contract_year: '2', amount: '32000' },
        },
        {
          items: [{ price: state.price_ids.plus_year3 }],
          duration: { interval: 'year', interval_count: 1 },
          default_tax_rates: [taxRateId],
          metadata: { contract_year: '3', amount: '38000' },
        },
      ],
      metadata: {
        contract_type: 'multiyear_ramp',
        contract_ref: 'GS-2026-PLU-003',
        country: 'DE',
        total_contract_value: '95000',
        payment_method: 'bank_transfer',
      },
    });

    logs.push({
      timestamp: new Date().toISOString(),
      action: 'subscription_schedule.create',
      detail: 'Plurianual 3 fases — 25k → 32k → 38k EUR/año (total 95k EUR)',
      stripe_id: schedule.id,
    });

    const subscriptionId = typeof schedule.subscription === 'string'
      ? schedule.subscription
      : schedule.subscription?.id || null;

    // Set payment_method_types to customer_balance (bank transfer only)
    if (subscriptionId) {
      await stripe.subscriptions.update(subscriptionId, {
        payment_settings: {
          payment_method_types: ['customer_balance', 'card'],
          payment_method_options: {
            customer_balance: {
              funding_type: 'bank_transfer',
              bank_transfer: {
                type: 'eu_bank_transfer',
                eu_bank_transfer: { country: 'DE' },
              },
            },
          },
        },
      });
    }

    // Fetch the draft invoice, set bank transfer as only payment method, then finalize
    let hostedInvoiceUrl: string | null = null;
    if (subscriptionId) {
      const invoices = await stripe.invoices.list({ subscription: subscriptionId, limit: 1 });
      if (invoices.data.length > 0) {
        let invoice = invoices.data[0];
        if (invoice.status === 'draft') {
          // Set bank transfer as the only payment method on this invoice
          await stripe.invoices.update(invoice.id, {
            payment_settings: {
              payment_method_types: ['customer_balance', 'card'],
              payment_method_options: {
                customer_balance: {
                  funding_type: 'bank_transfer',
                  bank_transfer: {
                    type: 'eu_bank_transfer',
                    eu_bank_transfer: { country: 'DE' },
                  },
                },
              },
            },
          });
          invoice = await stripe.invoices.finalizeInvoice(invoice.id);
        }
        hostedInvoiceUrl = invoice.hosted_invoice_url || null;
        logs.push({
          timestamp: new Date().toISOString(),
          action: 'invoice.finalized',
          detail: `Invoice finalizado — ${(invoice.total / 100).toLocaleString()} EUR — Bank Transfer only`,
          stripe_id: invoice.id,
        });
      }
    }

    setState({
      subscriptions: { ...state.subscriptions, contract3: subscriptionId },
      schedule_id: schedule.id,
    });

    return NextResponse.json({
      success: true,
      schedule_id: schedule.id,
      subscription_id: subscriptionId,
      hosted_invoice_url: hostedInvoiceUrl,
      status: schedule.status,
      phases: schedule.phases.map((phase, i) => ({
        year: i + 1,
        start_date: phase.start_date,
        end_date: phase.end_date,
        amount: [25000, 32000, 38000][i],
        metadata: phase.metadata,
      })),
      current_phase: schedule.current_phase
        ? { start: schedule.current_phase.start_date, end: schedule.current_phase.end_date }
        : null,
      logs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message, logs }, { status: 500 });
  }
}
