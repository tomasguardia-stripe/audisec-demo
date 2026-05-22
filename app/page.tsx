"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StripeKeyForm } from "@/components/stripe-key-form";

const contracts = [
  {
    id: 1,
    href: "/contracts/1-enterprise-spain",
    title: "Enterprise Directo — España",
    description: "Banco Regulado Español S.A.",
    details: "Enterprise + 4 módulos + 2 frameworks + servicios",
    amount: "18.000 EUR/año + 7.000 EUR one-off",
    tax: "IVA 21%",
    currency: "EUR",
    billing: "Anual · SEPA DD",
  },
  {
    id: 2,
    href: "/contracts/2-multitenant-latam",
    title: "Multitenant Partner — LATAM",
    description: "PartnerTech LATAM S.A. de C.V.",
    details: "Enterprise Multitenant + 3 entidades (escalable)",
    amount: "3.510,84 USD/mes",
    tax: "Exento",
    currency: "USD",
    billing: "Mensual · Tarjeta",
  },
  {
    id: 3,
    href: "/contracts/3-multiyear-ramp",
    title: "Plurianual Ramp-Up — Alemania",
    description: "EuroCompliance GmbH",
    details: "Plus con escalado anual: 25k → 32k → 38k",
    amount: "95.000 EUR total (3 años)",
    tax: "Reverse Charge 0%",
    currency: "EUR",
    billing: "Anual × 3 fases · Bank Transfer",
  },
  {
    id: 4,
    href: "/contracts/4-partner-indirect",
    title: "Partner Indirecto — España",
    description: "AuditPartners Iberia → Hospital Universitario",
    details: "Partner facturado, cliente final en metadata",
    amount: "18.000 EUR/año",
    tax: "IVA 21%",
    currency: "EUR",
    billing: "Anual · SEPA DD",
  },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Demo Stripe Billing — GlobalSuite Solutions</h1>
        <p className="text-gray-600">
          PoC con su catálogo real: 4 escenarios de contrato, Test Clocks, y ciclo de vida completo.
        </p>
      </div>

      <StripeKeyForm />

      <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-sm">
        <div className="font-semibold text-slate-800 mb-1">Arquitectura propuesta</div>
        <p className="text-slate-700">
          <strong>Stripe</strong> = motor de suscripciones, cobros automáticos, prorrateos, reintentos, y portal de cliente.
          <strong> Business Central</strong> = sistema de facturación legal.
          Stripe cobra y dispara automáticamente la generación de factura legal via webhooks — sin intervención manual.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts.map((c) => (
          <Link key={c.id} href={c.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Contrato {c.id}</Badge>
                  <Badge variant="secondary">{c.billing}</Badge>
                </div>
                <CardTitle className="text-lg mt-2">{c.title}</CardTitle>
                <CardDescription>{c.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="text-gray-700">{c.details}</p>
                <p className="font-mono font-medium">{c.amount}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{c.currency}</Badge>
                  <Badge variant="outline">{c.tax}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Flujo de la demo</h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li><strong>Setup:</strong> Crear catálogo completo en Stripe (productos, precios, clientes, test clocks)</li>
            <li><strong>Contratos:</strong> Crear cada suscripción con su configuración específica</li>
            <li><strong>Ciclo de vida:</strong> Upgrades, cambios de cantidad, descuentos — con prorrateo automático</li>
            <li><strong>Test Clocks:</strong> Simular paso del tiempo → ver cobros generados, transiciones de fase</li>
            <li><strong>Cobros:</strong> Ver invoices de Stripe (confirmaciones de cobro), line items, impuestos, campos personalizados</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
