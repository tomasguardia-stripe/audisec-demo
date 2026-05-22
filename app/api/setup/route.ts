import { getStripe } from '@/lib/stripe';
import { products, prices, customers, taxRates, coupons } from '@/lib/catalog';
import { setState } from '@/lib/store';
import { LogEntry } from '@/lib/types';

export async function POST() {
  const stripe = await getStripe();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: { type: string; data: unknown }) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // 1. Create Products
        send({ type: 'phase', data: 'Creando productos...' });
        const productIds: Record<string, string> = {};
        for (const [key, prod] of Object.entries(products)) {
          const created = await stripe.products.create({
            name: prod.name,
            description: prod.description,
            metadata: prod.metadata,
          });
          productIds[key] = created.id;
          send({ type: 'log', data: { action: 'product.create', detail: prod.name, stripe_id: created.id } });
        }

        // 2. Create Prices
        send({ type: 'phase', data: 'Creando precios...' });
        const priceIds: Record<string, string> = {};
        for (const [key, priceDef] of Object.entries(prices)) {
          const params: Parameters<typeof stripe.prices.create>[0] = {
            product: productIds[priceDef.productKey],
            unit_amount: priceDef.unit_amount,
            currency: priceDef.currency,
            nickname: priceDef.nickname,
          };
          if (priceDef.recurring) {
            params.recurring = { interval: priceDef.recurring.interval };
            if (priceDef.recurring.interval_count) {
              params.recurring.interval_count = priceDef.recurring.interval_count;
            }
          }
          const created = await stripe.prices.create(params);
          priceIds[key] = created.id;
          send({ type: 'log', data: { action: 'price.create', detail: `${priceDef.nickname || key} — ${(priceDef.unit_amount / 100).toLocaleString()} ${priceDef.currency.toUpperCase()}`, stripe_id: created.id } });
        }

        // 3. Create Tax Rates
        send({ type: 'phase', data: 'Creando tax rates...' });
        const taxRateIds: Record<string, string> = {};
        for (const [key, tr] of Object.entries(taxRates)) {
          const created = await stripe.taxRates.create({
            display_name: tr.display_name,
            percentage: tr.percentage,
            inclusive: tr.inclusive,
            country: tr.country,
            description: tr.description,
          });
          taxRateIds[key] = created.id;
          send({ type: 'log', data: { action: 'tax_rate.create', detail: `${tr.display_name} (${tr.percentage}%)`, stripe_id: created.id } });
        }

        // 4. Create Coupons
        send({ type: 'phase', data: 'Creando cupones...' });
        const couponIds: Record<string, string> = {};
        for (const [key, coupon] of Object.entries(coupons)) {
          const params: Record<string, unknown> = {
            name: coupon.name,
            duration: coupon.duration,
          };
          if ('percent_off' in coupon) params.percent_off = coupon.percent_off;
          if ('amount_off' in coupon) {
            params.amount_off = coupon.amount_off;
            params.currency = coupon.currency;
          }
          if ('duration_in_months' in coupon) params.duration_in_months = coupon.duration_in_months;
          const created = await stripe.coupons.create(params as Parameters<typeof stripe.coupons.create>[0]);
          couponIds[key] = created.id;
          send({ type: 'log', data: { action: 'coupon.create', detail: coupon.name, stripe_id: created.id } });
        }

        // 5. Create Test Clocks
        send({ type: 'phase', data: 'Creando test clocks...' });
        const testClockIds: Record<string, string> = {};
        const clockNames = [
          'Contrato 1 - Enterprise España',
          'Contrato 2 - Multitenant LATAM',
          'Contrato 3 - Plurianual Alemania',
          'Contrato 4 - Partner Indirecto',
        ];
        for (let i = 0; i < 4; i++) {
          const key = `contract${i + 1}`;
          const created = await stripe.testHelpers.testClocks.create({
            frozen_time: Math.floor(Date.now() / 1000),
            name: clockNames[i],
          });
          testClockIds[key] = created.id;
          send({ type: 'log', data: { action: 'test_clock.create', detail: clockNames[i], stripe_id: created.id } });
        }

        // 6. Create Customers
        send({ type: 'phase', data: 'Creando clientes y métodos de pago...' });
        const customerIds: Record<string, string> = {};
        const paymentMethodIds: Record<string, string> = {};
        for (const [key, cust] of Object.entries(customers)) {
          const created = await stripe.customers.create({
            name: cust.name,
            email: cust.email,
            metadata: cust.metadata,
            address: cust.address,
            preferred_locales: cust.preferred_locales,
            invoice_settings: cust.invoice_settings
              ? { custom_fields: cust.invoice_settings.custom_fields }
              : undefined,
            test_clock: testClockIds[key],
          });
          customerIds[key] = created.id;

          if (cust.tax_id) {
            await stripe.customers.createTaxId(created.id, {
              type: cust.tax_id.type as Parameters<typeof stripe.customers.createTaxId>[1]['type'],
              value: cust.tax_id.value,
            });
          }

          const isEU = ['ES', 'DE'].includes(cust.metadata.country);
          if (isEU) {
            const sepa = await stripe.paymentMethods.create({
              type: 'sepa_debit',
              sepa_debit: { iban: 'DE89370400440532013000' },
              billing_details: { name: cust.name, email: cust.email },
            });
            await stripe.paymentMethods.attach(sepa.id, { customer: created.id });
            await stripe.customers.update(created.id, {
              invoice_settings: {
                default_payment_method: sepa.id,
                custom_fields: cust.invoice_settings?.custom_fields,
              },
            });
            paymentMethodIds[key] = sepa.id;
            send({ type: 'log', data: { action: 'payment_method.attach', detail: `SEPA DD → ${cust.name}`, stripe_id: sepa.id } });
          } else {
            const pm = await stripe.paymentMethods.create({
              type: 'card',
              card: { token: 'tok_visa' },
            });
            await stripe.paymentMethods.attach(pm.id, { customer: created.id });
            await stripe.customers.update(created.id, {
              invoice_settings: {
                default_payment_method: pm.id,
                custom_fields: cust.invoice_settings?.custom_fields,
              },
            });
            paymentMethodIds[key] = pm.id;
            send({ type: 'log', data: { action: 'payment_method.attach', detail: `Card (Visa) → ${cust.name}`, stripe_id: pm.id } });
          }

          send({ type: 'log', data: { action: 'customer.create', detail: `${cust.name} (${cust.metadata.country})`, stripe_id: created.id } });
        }

        // 7. Configure Customer Portal
        send({ type: 'phase', data: 'Configurando Customer Portal...' });
        const portalConfig = await stripe.billingPortal.configurations.create({
          business_profile: {
            headline: 'GlobalSuite Solutions — Portal de cliente',
          },
          features: {
            payment_method_update: { enabled: true },
            invoice_history: { enabled: true },
            customer_update: {
              enabled: true,
              allowed_updates: ['email', 'address', 'tax_id'],
            },
            subscription_cancel: { enabled: false },
          },
        });
        send({ type: 'log', data: { action: 'portal.config.create', detail: 'Customer Portal configurado', stripe_id: portalConfig.id } });

        // Save state
        setState({
          setup_complete: true,
          product_ids: productIds,
          price_ids: priceIds,
          tax_rate_ids: taxRateIds,
          coupon_ids: couponIds,
          test_clocks: testClockIds,
          customers: customerIds,
          payment_methods: paymentMethodIds,
          portal_config_id: portalConfig.id,
        });

        send({ type: 'done', data: {
          products: Object.keys(productIds).length,
          prices: Object.keys(priceIds).length,
          tax_rates: Object.keys(taxRateIds).length,
          coupons: Object.keys(couponIds).length,
          test_clocks: Object.keys(testClockIds).length,
          customers: Object.keys(customerIds).length,
        }});

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        send({ type: 'error', data: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
