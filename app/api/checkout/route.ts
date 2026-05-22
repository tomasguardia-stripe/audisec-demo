import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getState } from '@/lib/store';
import { getBaseUrl } from '@/lib/url';
import { LogEntry } from '@/lib/types';

// Checkout uses reduced prices (÷10) to avoid the €10k SEPA DD sandbox limit.
// The real prices are shown in the UI and used for direct subscription creation.
// In production, the SEPA limit is raised and real prices would be used.

export async function POST(request: NextRequest) {
  const stripe = await getStripe();
  const state = getState();
  const logs: LogEntry[] = [];

  if (!state.setup_complete) {
    return NextResponse.json({ success: false, error: 'Ejecuta Setup primero' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { contract } = body;

    switch (contract) {
      case 'contract1': {
        // Create reduced one-time prices for demo checkout (÷10)
        const svcImpl = await stripe.prices.create({
          product: state.product_ids.services,
          unit_amount: 50000, // 500 EUR (demo: real is 5,000)
          currency: 'eur',
          nickname: 'Demo: Implantación',
        });
        const svcForm = await stripe.prices.create({
          product: state.product_ids.services,
          unit_amount: 20000, // 200 EUR (demo: real is 2,000)
          currency: 'eur',
          nickname: 'Demo: Formación',
        });
        // Create reduced recurring prices (÷10)
        const demoEnterprise = await stripe.prices.create({
          product: state.product_ids.license,
          unit_amount: 84000, // 840 EUR (demo: real is 8,400)
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: Enterprise',
        });
        const demoRisk = await stripe.prices.create({
          product: state.product_ids.mod_risk,
          unit_amount: 42000, // 420 EUR (demo: real is 4,200)
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: Risk',
        });
        const demoCompliance = await stripe.prices.create({
          product: state.product_ids.mod_compliance,
          unit_amount: 11000, // 110 EUR (demo: real is 1,100)
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: Compliance',
        });
        const demoPrivacy = await stripe.prices.create({
          product: state.product_ids.mod_privacy,
          unit_amount: 11000, // 110 EUR (demo: real is 1,100)
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: Privacy',
        });
        const demoFw1 = await stripe.prices.create({
          product: state.product_ids.fw_tier1,
          unit_amount: 11000, // 110 EUR (demo: real is 1,100)
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: FW Tier 1',
        });
        const demoFw2 = await stripe.prices.create({
          product: state.product_ids.fw_tier2,
          unit_amount: 21000, // 210 EUR (demo: real is 2,100)
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: FW Tier 2',
        });

        const session = await stripe.checkout.sessions.create({
          customer: state.customers.contract1,
          mode: 'subscription',
          payment_method_types: ['sepa_debit', 'card'],
          line_items: [
            { price: demoEnterprise.id, quantity: 1 },
            { price: demoRisk.id, quantity: 1 },
            { price: demoCompliance.id, quantity: 1 },
            { price: demoPrivacy.id, quantity: 1 },
            { price: demoFw1.id, quantity: 1 },
            { price: demoFw2.id, quantity: 1 },
            { price: svcImpl.id, quantity: 1 },
            { price: svcForm.id, quantity: 1 },
          ],
          subscription_data: {
            default_tax_rates: [state.tax_rate_ids.iva_21],
            metadata: {
              contract_type: 'direct_enterprise',
              contract_ref: 'GS-2026-ENT-001',
              country: 'ES',
              demo_note: 'prices_reduced_for_sandbox_sepa_limit',
            },
          },
          success_url: `${getBaseUrl(request)}/contracts/1-enterprise-spain?success=true`,
          cancel_url: `${getBaseUrl(request)}/contracts/1-enterprise-spain`,
        });

        logs.push({
          timestamp: new Date().toISOString(),
          action: 'checkout.session.create',
          detail: 'Checkout: Enterprise España — SEPA DD',
          stripe_id: session.id,
        });

        return NextResponse.json({ success: true, checkout_url: session.url, session_id: session.id, logs });
      }

      case 'contract2': {
        const session = await stripe.checkout.sessions.create({
          customer: state.customers.contract2,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            { price: state.price_ids.mt_enterprise_monthly_usd, quantity: 1 },
            { price: state.price_ids.mt_entity_monthly_usd, quantity: 3 },
          ],
          subscription_data: {
            default_tax_rates: [state.tax_rate_ids.exempt],
            metadata: {
              contract_type: 'multitenant_partner',
              contract_ref: 'GS-2026-MT-002',
              country: 'MX',
            },
          },
          success_url: `${getBaseUrl(request)}/contracts/2-multitenant-latam?success=true`,
          cancel_url: `${getBaseUrl(request)}/contracts/2-multitenant-latam`,
        });

        logs.push({
          timestamp: new Date().toISOString(),
          action: 'checkout.session.create',
          detail: 'Checkout: Multitenant LATAM — Card — 3.510 USD/mes',
          stripe_id: session.id,
        });

        return NextResponse.json({ success: true, checkout_url: session.url, session_id: session.id, logs });
      }

      case 'contract4': {
        // Reuse contract1's reduced prices approach
        const demoEnterprise = await stripe.prices.create({
          product: state.product_ids.license,
          unit_amount: 84000,
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: Enterprise (PTR)',
        });
        const demoRisk = await stripe.prices.create({
          product: state.product_ids.mod_risk,
          unit_amount: 42000,
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: Risk (PTR)',
        });
        const demoCompliance = await stripe.prices.create({
          product: state.product_ids.mod_compliance,
          unit_amount: 11000,
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: Compliance (PTR)',
        });
        const demoPrivacy = await stripe.prices.create({
          product: state.product_ids.mod_privacy,
          unit_amount: 11000,
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: Privacy (PTR)',
        });
        const demoFw1 = await stripe.prices.create({
          product: state.product_ids.fw_tier1,
          unit_amount: 11000,
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: FW Tier 1 (PTR)',
        });
        const demoFw2 = await stripe.prices.create({
          product: state.product_ids.fw_tier2,
          unit_amount: 21000,
          currency: 'eur',
          recurring: { interval: 'year' },
          nickname: 'Demo: FW Tier 2 (PTR)',
        });

        const session = await stripe.checkout.sessions.create({
          customer: state.customers.contract4,
          mode: 'subscription',
          payment_method_types: ['sepa_debit', 'card'],
          line_items: [
            { price: demoEnterprise.id, quantity: 1 },
            { price: demoRisk.id, quantity: 1 },
            { price: demoCompliance.id, quantity: 1 },
            { price: demoPrivacy.id, quantity: 1 },
            { price: demoFw1.id, quantity: 1 },
            { price: demoFw2.id, quantity: 1 },
          ],
          subscription_data: {
            default_tax_rates: [state.tax_rate_ids.iva_21],
            metadata: {
              contract_type: 'partner_indirect',
              contract_ref: 'GS-2026-PTR-004',
              partner_name: 'AuditPartners Iberia S.L.',
              end_client_name: 'Hospital Universitario Central',
              end_client_cif: 'Q2800001J',
              end_client_sector: 'healthcare',
              demo_note: 'prices_reduced_for_sandbox_sepa_limit',
            },
          },
          success_url: `${getBaseUrl(request)}/contracts/4-partner-indirect?success=true`,
          cancel_url: `${getBaseUrl(request)}/contracts/4-partner-indirect`,
        });

        logs.push({
          timestamp: new Date().toISOString(),
          action: 'checkout.session.create',
          detail: 'Checkout: Partner Indirecto — SEPA DD',
          stripe_id: session.id,
        });

        return NextResponse.json({ success: true, checkout_url: session.url, session_id: session.id, logs });
      }

      default:
        return NextResponse.json({ success: false, error: `Contract ${contract} not supported` }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message, logs }, { status: 500 });
  }
}
