import Stripe from 'stripe';
import { headers } from 'next/headers';

export async function getStripe(): Promise<Stripe> {
  const headersList = await headers();
  const key = headersList.get('x-stripe-key') || process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('No se ha proporcionado una clave de Stripe. Configúrala en la app.');
  }

  if (key.startsWith('sk_live_')) {
    throw new Error('Esta demo solo funciona con claves de test (sk_test_...). No uses claves de producción.');
  }

  if (!key.startsWith('sk_test_')) {
    throw new Error('La clave debe empezar por sk_test_...');
  }

  return new Stripe(key, {
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
  });
}
