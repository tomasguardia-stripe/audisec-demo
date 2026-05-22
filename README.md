# Demo Stripe Billing — GlobalSuite Solutions

PoC funcional de Stripe Billing con vuestro catálogo real: 4 escenarios de contrato, Test Clocks, y ciclo de vida completo.

## Primeros pasos

1. Abre la demo (el link que te hemos compartido)
2. En la página principal, introduce tu **clave secreta de test** de Stripe (`sk_test_...`)
   - Encuéntrala en: https://dashboard.stripe.com/test/apikeys
   - La clave se guarda solo en tu navegador — no se almacena en el servidor
3. Ve a **Setup** y pulsa "Crear catálogo en Stripe"
4. Explora los 4 escenarios de contrato

## Flujo de la demo

1. **Setup** (`/setup`) — Crea el catálogo completo en tu sandbox (productos, precios, clientes, test clocks)
2. **Contrato 1** — Enterprise Directo (España): suscripción anual, SEPA DD, upgrade con prorrateo
3. **Contrato 2** — Multitenant Partner (LATAM): mensual, tarjeta, añadir entidades
4. **Contrato 3** — Plurianual Ramp-Up (Alemania): Subscription Schedule con 3 fases, bank transfer
5. **Contrato 4** — Partner Indirecto (España): facturación a partner, cliente final en metadata
6. **Test Clocks** — Simular paso del tiempo para ver cobros generados y transiciones de fase
7. **Cobros** — Ver todas las invoices de Stripe generadas

## Escenarios incluidos

| # | Tipo | Moneda | Impuesto | Cobro |
|---|------|--------|----------|-------|
| 1 | Enterprise Directo (España) | EUR | IVA 21% | SEPA Direct Debit |
| 2 | Multitenant Partner (LATAM) | USD | Exento | Tarjeta |
| 3 | Plurianual Ramp-Up (Alemania) | EUR | Reverse Charge 0% | Bank Transfer |
| 4 | Partner Indirecto (España) | EUR | IVA 21% | SEPA Direct Debit |

## Ejecución local

Si queréis ejecutar la demo en local:

```bash
git clone <este-repo>
cd audisec-billing-demo
npm install
cp .env.example .env.local
# Editar .env.local con vuestra clave sk_test_...
npm run dev
```

Abrir http://localhost:3000

## Nota sobre el estado

La demo usa estado en memoria en el servidor. El estado se guarda automáticamente en tu navegador. Si el servidor se reinicia (tras unos minutos de inactividad), verás un banner para restaurar el estado con un clic.

Si preferís empezar de cero, simplemente volved a `/setup`.

## Stack técnico

- Next.js 16 (App Router) + TypeScript
- Stripe SDK v22 (API version `2026-03-25.dahlia`)
- Tailwind CSS + shadcn/ui

## Patrones de Stripe API demostrados

- Subscriptions con múltiples items y tax rates manuales
- Subscription Schedules con fases (ramp-up plurianual)
- Checkout Sessions para cobro inicial
- Customer Portal para autogestión
- Test Clocks para simular paso del tiempo
- Invoice Items para servicios one-off
- Proration behavior configurable (cobro inmediato / próximo ciclo / sin ajuste)
- Metadata para campos personalizados (contrato, centro de coste, PO)
