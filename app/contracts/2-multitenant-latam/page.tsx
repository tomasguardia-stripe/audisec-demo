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

export default function Contract2Page() {
  return (
    <Suspense>
      <Contract2Content />
    </Suspense>
  );
}

function Contract2Content() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [subscription, setSubscription] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prorationMode, setProrationMode] = useState<string>("create_prorations");
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
      body: JSON.stringify({ contract: "contract2" }),
    });
    const data = await res.json();
    if (data.success) {
      setSubscription({ subscription_id: data.subscription_id, status: "active" });
      setLogs((prev) => [...prev, {
        timestamp: new Date().toISOString(),
        action: "checkout.complete",
        detail: "Cliente pagó via Checkout — suscripción activada",
        stripe_id: data.subscription_id,
      }]);
    }
  }

  async function createSubscription() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/contracts/2", { method: "POST" });
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

  async function addEntities() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_entities", contract: "contract2", new_quantity: 5, proration_behavior: prorationMode }),
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
          <Badge>Contrato 2</Badge>
          <Badge variant="outline">USD</Badge>
          <Badge variant="outline">Exento</Badge>
        </div>
        <h1 className="text-2xl font-bold">Multitenant Partner — LATAM</h1>
        <p className="text-gray-600">PartnerTech LATAM S.A. de C.V. — Suscripción mensual con entidades variables</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Composición del contrato</CardTitle>
            <CardDescription>Modelo multitenant mensual en USD</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="space-y-1">
              <div className="font-medium">Suscripción (mensual):</div>
              <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                <li>Multitenant Enterprise — 2.658,33 USD/mes</li>
                <li>Entidad Multitenant × 3 — 284,17 USD/mes c/u</li>
              </ul>
              <Separator className="my-2" />
              <div className="font-mono font-medium">Total mensual: 3.510,84 USD</div>
              <div className="text-gray-500">(= 2.658,33 + 284,17 × 3)</div>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="font-medium">Lógica multitenant:</div>
              <p className="text-gray-700">
                Las entidades son quantity-based. Cuando el partner añade clientes, se incrementa
                la cantidad → prorrateo automático en el ciclo actual.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
            <CardDescription>Partner multitenant en México</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><span className="text-gray-500">Nombre:</span> PartnerTech LATAM S.A. de C.V.</div>
            <div><span className="text-gray-500">País:</span> México</div>
            <div><span className="text-gray-500">Moneda:</span> USD</div>
            <div><span className="text-gray-500">Impuesto:</span> Exento (LATAM)</div>
            <div><span className="text-gray-500">Cobro:</span> Tarjeta (automático)</div>
            <Separator />
            <div className="font-medium">Custom fields (viajan al ERP):</div>
            <ul className="text-gray-700 space-y-0.5">
              <li>N. Contrato: GS-2026-MT-002</li>
              <li>Partner ID: PTR-LATAM-005</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckoutLink contractKey="contract2" disabled={!!subscription} />
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
            <div className="flex flex-wrap gap-3 items-end">
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
              <Button onClick={addEntities} disabled={loading || !subscription} variant="secondary">
                Añadir 2 entidades (3 → 5)
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
              <div className="text-green-800">
                Items: {(subscription.items as Array<Record<string, unknown>>)?.map(
                  (item) => `${item.nickname} (×${item.quantity})`
                ).join(", ")}
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
