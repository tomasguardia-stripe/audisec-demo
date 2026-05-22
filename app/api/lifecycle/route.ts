import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getState } from '@/lib/store';
import { LogEntry } from '@/lib/types';

export async function POST(request: NextRequest) {
  const stripe = await getStripe();
  const state = getState();
  const logs: LogEntry[] = [];

  if (!state.setup_complete) {
    return NextResponse.json({ success: false, error: 'Setup not complete' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, contract } = body;

    switch (action) {
      // Contract 1: Add Audit module (upgrade with configurable proration)
      case 'add_audit_module': {
        const subId = state.subscriptions.contract1;
        if (!subId) {
          return NextResponse.json({ success: false, error: 'Contract 1 not created yet' }, { status: 400 });
        }

        const prorationBehavior = body.proration_behavior || 'always_invoice';
        const behaviorLabels: Record<string, string> = {
          always_invoice: 'Cobro inmediato (always_invoice)',
          create_prorations: 'En próximo cobro (create_prorations)',
          none: 'Sin ajuste (none)',
        };

        const updated = await stripe.subscriptions.update(subId, {
          items: [{ price: state.price_ids.mod_audit_annual }],
          proration_behavior: prorationBehavior,
        });

        logs.push({
          timestamp: new Date().toISOString(),
          action: 'subscription.update',
          detail: `Añadido módulo Audit Management — ${behaviorLabels[prorationBehavior] || prorationBehavior}`,
          stripe_id: updated.id,
        });

        // If always_invoice, fetch the new invoice that was just created
        let newInvoiceId: string | null = null;
        if (prorationBehavior === 'always_invoice') {
          const invoices = await stripe.invoices.list({
            subscription: subId,
            limit: 1,
          });
          if (invoices.data.length > 0 && invoices.data[0].status === 'paid') {
            newInvoiceId = invoices.data[0].id;
            logs.push({
              timestamp: new Date().toISOString(),
              action: 'invoice.paid',
              detail: `Prorrateo cobrado inmediatamente — ${(invoices.data[0].total / 100).toLocaleString()} EUR`,
              stripe_id: invoices.data[0].id,
            });
          }
        }

        return NextResponse.json({
          success: true,
          subscription: updated.id,
          items_count: updated.items.data.length,
          proration_behavior: prorationBehavior,
          new_invoice_id: newInvoiceId,
          logs,
        });
      }

      // Contract 1: Apply 15% first-year discount
      case 'apply_discount_15': {
        const subId = state.subscriptions.contract1;
        if (!subId) {
          return NextResponse.json({ success: false, error: 'Contract 1 not created yet' }, { status: 400 });
        }
        const updated = await stripe.subscriptions.update(subId, {
          discounts: [{ coupon: state.coupon_ids.first_year_15 }],
        });
        logs.push({
          timestamp: new Date().toISOString(),
          action: 'subscription.update',
          detail: 'Aplicado cupón 15% primer año',
          stripe_id: updated.id,
        });
        return NextResponse.json({ success: true, subscription: updated.id, discounts: updated.discounts, logs });
      }

      // Contract 2: Add entities (quantity change)
      case 'add_entities': {
        const subId = state.subscriptions.contract2;
        if (!subId) {
          return NextResponse.json({ success: false, error: 'Contract 2 not created yet' }, { status: 400 });
        }
        const newQuantity = body.new_quantity || 5;

        // Find the entity subscription item
        const sub = await stripe.subscriptions.retrieve(subId);
        const entityItem = sub.items.data.find(
          (item) => item.price?.id === state.price_ids.mt_entity_monthly_usd
        );
        if (!entityItem) {
          return NextResponse.json({ success: false, error: 'Entity item not found' }, { status: 400 });
        }

        const prorationBehavior = body.proration_behavior || 'create_prorations';
        const behaviorLabels: Record<string, string> = {
          always_invoice: 'Cobro inmediato',
          create_prorations: 'En próximo cobro',
          none: 'Sin ajuste',
        };

        const updated = await stripe.subscriptionItems.update(entityItem.id, {
          quantity: newQuantity,
          proration_behavior: prorationBehavior,
        });
        logs.push({
          timestamp: new Date().toISOString(),
          action: 'subscription_item.update',
          detail: `Entidades: ${entityItem.quantity} → ${newQuantity} — ${behaviorLabels[prorationBehavior] || prorationBehavior}`,
          stripe_id: updated.id,
        });
        return NextResponse.json({ success: true, item_id: updated.id, old_quantity: entityItem.quantity, new_quantity: newQuantity, logs });
      }

      // Contract 4: Show end-client metadata search
      case 'search_end_client': {
        const subId = state.subscriptions.contract4;
        if (!subId) {
          return NextResponse.json({ success: false, error: 'Contract 4 not created yet' }, { status: 400 });
        }
        const sub = await stripe.subscriptions.retrieve(subId);
        logs.push({
          timestamp: new Date().toISOString(),
          action: 'subscription.retrieve',
          detail: `Metadata cliente final: ${sub.metadata.end_client_name} (${sub.metadata.end_client_cif})`,
          stripe_id: sub.id,
        });
        return NextResponse.json({ success: true, metadata: sub.metadata, logs });
      }

      // Contract 3: Simulate bank transfer (fund customer cash balance)
      case 'simulate_bank_transfer': {
        const customerId = state.customers.contract3;
        if (!customerId) {
          return NextResponse.json({ success: false, error: 'Contract 3 customer not found' }, { status: 400 });
        }

        const amount = body.amount || 2500000; // 25,000 EUR in cents (year 1)

        await stripe.testHelpers.customers.fundCashBalance(customerId, {
          amount,
          currency: 'eur',
        });

        logs.push({
          timestamp: new Date().toISOString(),
          action: 'cash_balance.funded',
          detail: `Transferencia simulada: ${(amount / 100).toLocaleString()} EUR → Stripe reconcilia automáticamente`,
          stripe_id: customerId,
        });

        return NextResponse.json({ success: true, amount: amount / 100, logs });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message, logs }, { status: 500 });
  }
}
