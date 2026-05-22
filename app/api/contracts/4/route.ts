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
    const customerId = state.customers.contract4;
    const taxRateId = state.tax_rate_ids.iva_21;

    // Partner subscription — same products as Contract 1, billed to partner
    // End client info lives in metadata
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        { price: state.price_ids.enterprise_annual },
        { price: state.price_ids.mod_risk_annual },
        { price: state.price_ids.mod_compliance_annual },
        { price: state.price_ids.mod_privacy_annual },
        { price: state.price_ids.fw_tier1_annual },
        { price: state.price_ids.fw_tier2_annual },
      ],
      default_tax_rates: [taxRateId],
      collection_method: 'send_invoice',
      days_until_due: 14,
      payment_settings: {
        payment_method_types: ['sepa_debit', 'card'],
      },
      metadata: {
        contract_type: 'partner_indirect',
        contract_ref: 'GS-2026-PTR-004',
        partner_name: 'AuditPartners Iberia S.L.',
        end_client_name: 'Hospital Universitario Central',
        end_client_cif: 'Q2800001J',
        end_client_country: 'ES',
        end_client_sector: 'healthcare',
        payment_method: 'sepa_debit',
      },
    });

    logs.push({
      timestamp: new Date().toISOString(),
      action: 'subscription.create',
      detail: 'Partner Indirecto — AuditPartners → Hospital Universitario — 18.000 EUR/año',
      stripe_id: subscription.id,
    });

    // Set payment methods on invoice and finalize to get hosted_invoice_url
    let hostedInvoiceUrl: string | null = null;
    const invoices = await stripe.invoices.list({ subscription: subscription.id, limit: 1 });
    if (invoices.data.length > 0) {
      let invoice = invoices.data[0];
      if (invoice.status === 'draft') {
        await stripe.invoices.update(invoice.id, {
          payment_settings: { payment_method_types: ['sepa_debit', 'card'] },
        });
        invoice = await stripe.invoices.finalizeInvoice(invoice.id);
      }
      hostedInvoiceUrl = invoice.hosted_invoice_url || null;
      logs.push({
        timestamp: new Date().toISOString(),
        action: 'invoice.finalized',
        detail: `Invoice listo — ${(invoice.total / 100).toLocaleString()} EUR`,
        stripe_id: invoice.id,
      });
    }

    // Switch to charge_automatically for future invoices (renewals)
    await stripe.subscriptions.update(subscription.id, {
      collection_method: 'charge_automatically',
    });

    setState({
      subscriptions: { ...state.subscriptions, contract4: subscription.id },
    });

    return NextResponse.json({
      success: true,
      subscription_id: subscription.id,
      status: subscription.status,
      hosted_invoice_url: hostedInvoiceUrl,
      items: subscription.items.data.map((item) => ({
        id: item.id,
        price_id: item.price?.id,
        amount: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        nickname: item.price?.nickname,
      })),
      metadata: subscription.metadata,
      logs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message, logs }, { status: 500 });
  }
}
