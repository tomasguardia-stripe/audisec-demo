"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ActivityLog } from "@/components/activity-log";
import { LogEntry } from "@/lib/types";

export default function Contract3Page() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [schedule, setSchedule] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createSchedule() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/contracts/3", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSchedule(data);
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

  async function simulateTransfer() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate_bank_transfer", amount: 2500000 }),
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

  async function advanceYear() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract: "contract3", advance_days: 366 }),
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
          <Badge>Contrato 3</Badge>
          <Badge variant="outline">EUR</Badge>
          <Badge variant="outline">Reverse Charge</Badge>
        </div>
        <h1 className="text-2xl font-bold">Plurianual Ramp-Up — Alemania</h1>
        <p className="text-gray-600">EuroCompliance GmbH — Subscription Schedule con 3 fases de escalado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fases del contrato</CardTitle>
            <CardDescription>Subscription Schedule con precios escalonados</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="flex items-center gap-3 p-3 rounded bg-blue-50 border border-blue-200">
              <div className="font-bold text-blue-700">Año 1</div>
              <div className="flex-1">GlobalSuite Plus</div>
              <div className="font-mono font-medium">25.000 EUR</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded bg-gray-50 border">
              <div className="font-bold text-gray-500">Año 2</div>
              <div className="flex-1">GlobalSuite Plus</div>
              <div className="font-mono font-medium">32.000 EUR</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded bg-gray-50 border">
              <div className="font-bold text-gray-500">Año 3</div>
              <div className="flex-1">GlobalSuite Plus</div>
              <div className="font-mono font-medium">38.000 EUR</div>
            </div>
            <Separator />
            <div className="font-mono font-medium">Valor total contrato: 95.000 EUR (3 años)</div>
            <p className="text-gray-500 text-xs">
              end_behavior: cancel — al finalizar año 3 se requiere renegociación comercial
            </p>
            <Separator />
            <div className="space-y-1">
              <div className="font-medium">Método de pago: Bank Transfer</div>
              <p className="text-gray-700 text-xs">
                Stripe genera invoice con IBAN virtual (VBAN). El cliente transfiere a ese IBAN.
                Stripe reconcilia automáticamente. Plazo: 14 días.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
            <CardDescription>Enterprise alemán — EU B2B Reverse Charge</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><span className="text-gray-500">Nombre:</span> EuroCompliance GmbH</div>
            <div><span className="text-gray-500">País:</span> Alemania</div>
            <div><span className="text-gray-500">VAT ID:</span> DE123456789</div>
            <div><span className="text-gray-500">Moneda:</span> EUR</div>
            <div><span className="text-gray-500">Impuesto:</span> Reverse Charge (0%)</div>
            <div><span className="text-gray-500">Idioma invoice:</span> Inglés</div>
            <div><span className="text-gray-500">Cobro:</span> Bank Transfer (invoice con IBAN virtual)</div>
            <Separator />
            <div className="font-medium">Custom fields (viajan al ERP):</div>
            <ul className="text-gray-700 space-y-0.5">
              <li>Contract Ref: GS-2026-PLU-003</li>
              <li>PO Number: PO-EC-2026-119</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button onClick={createSchedule} disabled={loading || !!schedule}>
                {schedule ? "Schedule creado" : loading ? "Creando..." : "Crear Subscription Schedule"}
              </Button>
              <Button onClick={simulateTransfer} disabled={loading || !schedule} variant="secondary">
                Simular transferencia del cliente (25.000 EUR)
              </Button>
              <Button onClick={advanceYear} disabled={loading || !schedule} variant="secondary">
                Avanzar 1 año (→ Fase 2)
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          {schedule && (
            <div className="space-y-3">
              <div className="p-4 rounded bg-green-50 border border-green-200 text-sm">
                <div className="font-medium text-green-900">Subscription Schedule activo</div>
                <div className="text-green-800 mt-1 font-mono">
                  Schedule: {schedule.schedule_id as string}
                </div>
                <div className="text-green-800 font-mono">
                  Subscription: {schedule.subscription_id as string}
                </div>
                <div className="text-green-800">
                  Status: {schedule.status as string} — Fase 1 de 3
                </div>
              </div>

              {(schedule.hosted_invoice_url as string | null) ? (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
                  <div className="text-sm font-medium text-blue-900">
                    Invoice enviado al cliente con instrucciones de Bank Transfer:
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={schedule.hosted_invoice_url as string}
                      className="flex-1 text-xs font-mono bg-white border rounded px-3 py-2 text-gray-700"
                    />
                    <button
                      className="px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => window.open(schedule.hosted_invoice_url as string, "_blank")}
                    >
                      Ver como cliente →
                    </button>
                  </div>
                  <p className="text-xs text-blue-700">
                    El cliente ve el invoice con un IBAN virtual (VBAN). Transfiere a ese IBAN y Stripe reconcilia automáticamente.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  Nota: El hosted invoice URL no está disponible (posiblemente el invoice aún no se ha finalizado).
                  Puedes verlo en el Dashboard → Invoices.
                </div>
              )}
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
