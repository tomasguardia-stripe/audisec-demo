"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ActivityLog } from "@/components/activity-log";
import { CheckoutLink } from "@/components/checkout-link";
import { LogEntry } from "@/lib/types";

export default function Contract1Page() {
  return (
    <Suspense>
      <Contract1Content />
    </Suspense>
  );
}

function Contract1Content() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [subscription, setSubscription] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prorationMode, setProrationMode] = useState<string>("always_invoice");
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true" && !subscription) {
      syncSubscription();
    }
  }, [searchParams]);

  async function syncSubscription() {
    const res = await apiFetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contract: "contract1" }),
    });
    const data = await res.json();
    if (data.success) {
      setSubscription({ subscription_id: data.subscription_id, status: "active" });
      setLogs((prev) => [...prev, {
        timestamp: new Date().toISOString(),
        action: "checkout.complete",
        detail: `Cliente pagó via Checkout — suscripción activada`,
        stripe_id: data.subscription_id,
      }]);
    }
  }

  async function createSubscription() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/contracts/1", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSubscription(data);
        setLogs((prev) => [...prev, ...data.logs]);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function addAuditModule() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_audit_module",
          contract: "contract1",
          proration_behavior: prorationMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => [...prev, ...data.logs]);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function applyDiscount() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply_discount_15", contract: "contract1" }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => [...prev, ...data.logs]);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge>Contrato 1</Badge>
          <Badge variant="outline">EUR</Badge>
          <Badge variant="outline">IVA 21%</Badge>
        </div>
        <h1 className="text-2xl font-bold">Enterprise Directo — España</h1>
        <p className="text-gray-600">Banco Regulado Español S.A. — Suscripción anual con servicios de implantación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Composición del contrato</CardTitle>
            <CardDescription>Lo que se creará en Stripe</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="space-y-1">
              <div className="font-medium">Suscripción (anual):</div>
              <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                <li>GlobalSuite Enterprise — 8.400 EUR</li>
                <li>Risk Management — 4.200 EUR</li>
                <li>Compliance & Security — 1.100 EUR</li>
                <li>Privacy Management — 1.100 EUR</li>
                <li>Framework Tier 1 (ISO 27001) — 1.100 EUR</li>
                <li>Framework Tier 2 (GDPR) — 2.100 EUR</li>
              </ul>
              <div className="font-mono font-medium mt-1">Total recurrente: 18.000 EUR/año</div>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="font-medium">One-off (primer cobro):</div>
              <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                <li>Implantación y configuración — 5.000 EUR</li>
                <li>Formación equipo compliance — 2.000 EUR</li>
              </ul>
              <div className="font-mono font-medium mt-1">Total one-off: 7.000 EUR</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
            <CardDescription>Datos del customer en Stripe</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><span className="text-gray-500">Nombre:</span> Banco Regulado Español S.A.</div>
            <div><span className="text-gray-500">País:</span> España</div>
            <div><span className="text-gray-500">CIF:</span> A12345678</div>
            <div><span className="text-gray-500">Moneda:</span> EUR</div>
            <div><span className="text-gray-500">Impuesto:</span> IVA 21%</div>
            <div><span className="text-gray-500">Cobro:</span> SEPA Direct Debit (automático)</div>
            <Separator />
            <div className="font-medium">Custom fields (viajan al ERP):</div>
            <ul className="text-gray-700 space-y-0.5">
              <li>N. Contrato: GS-2026-ENT-001</li>
              <li>Centro de coste: CC-COMPLIANCE-01</li>
              <li>PO Number: PO-2026-0042</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Paso 1: Enviar link de pago al cliente</div>
            <div className="flex items-center gap-3">
              <CheckoutLink contractKey="contract1" disabled={!!subscription} />
              {!subscription && (
                <Button onClick={createSubscription} disabled={loading} variant="ghost" size="sm" className="text-xs text-gray-500">
                  o crear directamente
                </Button>
              )}
            </div>

            {subscription && (
              <div className="p-3 rounded bg-green-50 border border-green-200 text-sm text-green-800">
                Suscripción activa:{" "}
                <a
                  href={`https://dashboard.stripe.com/test/subscriptions/${subscription.subscription_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-mono"
                >
                  {subscription.subscription_id as string}
                </a>
              </div>
            )}

            <Separator />

            <div className="text-sm font-medium text-gray-700">Paso 2: Ciclo de vida (tras pago del cliente)</div>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-end gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Comportamiento de prorrateo:</label>
                  <select
                    className="border rounded px-2 py-1.5 text-sm bg-white"
                    value={prorationMode}
                    onChange={(e) => setProrationMode(e.target.value)}
                    disabled={!subscription}
                  >
                    <option value="always_invoice">Cobro inmediato</option>
                    <option value="create_prorations">En próximo cobro</option>
                    <option value="none">Sin ajuste</option>
                  </select>
                </div>
                <Button onClick={addAuditModule} disabled={loading || !subscription} variant="secondary">
                  Añadir módulo Audit (+10.500 EUR)
                </Button>
              </div>
              <Button onClick={applyDiscount} disabled={loading || !subscription} variant="secondary">
                Aplicar descuento 15% primer año
              </Button>
            </div>
          </div>

          <div className="p-3 rounded bg-blue-50 border border-blue-100 text-xs text-blue-800">
            <span className="font-medium">Opciones de prorrateo al añadir módulos mid-contrato:</span>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li><strong>Cobro inmediato</strong> (always_invoice) — Genera invoice y cobra ahora la parte proporcional. Recomendado para contratos anuales.</li>
              <li><strong>En próximo cobro</strong> (create_prorations) — Acumula el prorrateo y lo cobra en la siguiente renovación. Mejor para ciclos mensuales.</li>
              <li><strong>Sin ajuste</strong> (none) — El módulo se activa sin cobro adicional hasta la renovación. Útil para upgrades cortesía/promocionales.</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          {subscription && (
            <div className="p-4 rounded bg-green-50 border border-green-200 text-sm">
              <div className="font-medium text-green-900">Suscripción activa</div>
              <div className="text-green-800 mt-1 font-mono">
                ID: {subscription.subscription_id as string}
              </div>
              <div className="text-green-800">
                Status: {subscription.status as string}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log de operaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLog logs={logs} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
