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

export default function Contract4Page() {
  return (
    <Suspense>
      <Contract4Content />
    </Suspense>
  );
}

function Contract4Content() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [subscription, setSubscription] = useState<Record<string, unknown> | null>(null);
  const [endClientMeta, setEndClientMeta] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      body: JSON.stringify({ contract: "contract4" }),
    });
    const data = await res.json();
    if (data.success) {
      setSubscription({ subscription_id: data.subscription_id, status: "active" });
      setLogs((prev) => [...prev, {
        timestamp: new Date().toISOString(),
        action: "checkout.complete",
        detail: "Partner pagó via Checkout — suscripción activada",
        stripe_id: data.subscription_id,
      }]);
    }
  }

  async function createSubscription() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/contracts/4", { method: "POST" });
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

  async function showEndClientMetadata() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search_end_client", contract: "contract4" }),
      });
      const data = await res.json();
      if (data.success) {
        setEndClientMeta(data.metadata);
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
          <Badge>Contrato 4</Badge>
          <Badge variant="outline">EUR</Badge>
          <Badge variant="outline">IVA 21%</Badge>
        </div>
        <h1 className="text-2xl font-bold">Partner Indirecto — España</h1>
        <p className="text-gray-600">AuditPartners factura, Hospital Universitario es el cliente final (en metadata)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modelo Partner Indirecto</CardTitle>
            <CardDescription>El partner compra para su cliente final</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="space-y-1">
              <div className="font-medium">Misma composición que Contrato 1:</div>
              <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                <li>GlobalSuite Enterprise — 8.400 EUR</li>
                <li>Risk Management — 4.200 EUR</li>
                <li>Compliance & Security — 1.100 EUR</li>
                <li>Privacy Management — 1.100 EUR</li>
                <li>Framework Tier 1 — 1.100 EUR</li>
                <li>Framework Tier 2 — 2.100 EUR</li>
              </ul>
              <div className="font-mono font-medium mt-2">Total: 18.000 EUR/año</div>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="font-medium">Diferencia clave:</div>
              <p className="text-gray-700">
                El Customer en Stripe es AuditPartners (entidad facturada).
                El cliente final (Hospital) viaja en metadata y custom_fields.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entidades involucradas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="p-3 rounded bg-blue-50 border border-blue-200">
              <div className="font-medium text-blue-800">Partner (facturado):</div>
              <div className="text-blue-700">AuditPartners Iberia S.L.</div>
              <div className="text-blue-600 text-xs">CIF: B87654321 — Barcelona</div>
            </div>
            <div className="p-3 rounded bg-amber-50 border border-amber-200">
              <div className="font-medium text-amber-800">Cliente final (metadata):</div>
              <div className="text-amber-700">Hospital Universitario Central</div>
              <div className="text-amber-600 text-xs">CIF: Q2800001J — Sector: Healthcare</div>
            </div>
            <Separator />
            <div className="font-medium">Custom fields (viajan al ERP):</div>
            <ul className="text-gray-700 space-y-0.5 text-xs">
              <li>N. Contrato: GS-2026-PTR-004</li>
              <li>Cliente final: Hospital Universitario Central</li>
              <li>CIF cliente final: Q2800001J</li>
              <li>PO Number: PO-AP-2026-033</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckoutLink contractKey="contract4" disabled={!!subscription} />
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
            <div className="flex flex-wrap gap-3">
              <Button onClick={showEndClientMetadata} disabled={loading || !subscription} variant="secondary">
                Ver metadata cliente final
              </Button>
            </div>
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
            </div>
          )}

          {endClientMeta && (
            <div className="p-4 rounded bg-amber-50 border border-amber-200 text-sm">
              <div className="font-medium text-amber-900 mb-2">Metadata del cliente final (viaja con webhooks)</div>
              <div className="font-mono text-xs space-y-1">
                {Object.entries(endClientMeta).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-amber-600">{k}:</span> {v}
                  </div>
                ))}
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
