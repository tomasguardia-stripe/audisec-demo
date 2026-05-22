"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ActivityLog } from "@/components/activity-log";
import { LogEntry } from "@/lib/types";

export default function PortalPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function openPortal(customerKey: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_key: customerKey }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => [...prev, ...data.logs]);
        window.open(data.url, "_blank");
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const portalCustomers = [
    { key: "contract1", name: "Banco Regulado Español", type: "Cliente directo", badge: "Enterprise" },
    { key: "contract2", name: "PartnerTech LATAM", type: "Partner multitenant", badge: "Multitenant" },
    { key: "contract4", name: "AuditPartners Iberia", type: "Partner indirecto", badge: "Enterprise" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge>Customer Portal</Badge>
          <Badge variant="outline">Self-service</Badge>
        </div>
        <h1 className="text-2xl font-bold">Portal de Cliente — Autoservicio</h1>
        <p className="text-gray-600">
          Los clientes se autogestionan pagos y upgrades. GlobalSuite controla qué operaciones están permitidas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> Habilitado (self-serve)
            </CardTitle>
            <CardDescription>El cliente puede hacer esto sin contactar a GlobalSuite</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&#10003;</span>
                <div>
                  <div className="font-medium">Actualizar método de pago</div>
                  <div className="text-gray-500 text-xs">Cambiar tarjeta, actualizar IBAN SEPA</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&#10003;</span>
                <div>
                  <div className="font-medium">Ver historial de cobros</div>
                  <div className="text-gray-500 text-xs">Confirmaciones de pago (la factura legal viene de Business Central)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&#10003;</span>
                <div>
                  <div className="font-medium">Actualizar datos fiscales</div>
                  <div className="text-gray-500 text-xs">Email, dirección, VAT ID</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&#10003;</span>
                <div>
                  <div className="font-medium">Consultar suscripción activa</div>
                  <div className="text-gray-500 text-xs">Plan, módulos, próxima renovación, importe actual</div>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cambios en suscripción</CardTitle>
            <CardDescription>Gestionados por vuestra app (API Stripe)</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">&#8594;</span>
                <div>
                  <div className="font-medium">Upgrade de plan o añadir módulos</div>
                  <div className="text-gray-500 text-xs">Via vuestra app (API Stripe). Prorrateo automático. Como Contrato 1 en esta demo.</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">&#10007;</span>
                <div>
                  <div className="font-medium">Downgrade de plan</div>
                  <div className="text-gray-500 text-xs">No permitido hasta renovación (regla comercial)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">&#10007;</span>
                <div>
                  <div className="font-medium">Eliminar módulos o add-ons</div>
                  <div className="text-gray-500 text-xs">No se aplica hasta renovación</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">&#10007;</span>
                <div>
                  <div className="font-medium">Cancelar suscripción</div>
                  <div className="text-gray-500 text-xs">Depende del contrato, decisión comercial</div>
                </div>
              </li>
            </ul>
            <Separator />
            <p className="text-xs text-gray-500">
              Upgrades y módulos requieren validar reglas (límite de módulos por plan, compatibilidad).
              Vuestra app llama a la API de Stripe → prorrateo automático → cobro inmediato o en siguiente periodo.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm">
        <div className="font-semibold text-amber-900 mb-1">Nota sobre facturas legales</div>
        <p className="text-amber-800">
          El portal muestra historial de <strong>cobros</strong> (confirmaciones de pago de Stripe).
          La <strong>factura legal</strong> la recibe el cliente por email desde Business Central, como hoy — pero ahora de forma automática via webhook.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abrir portal como cliente</CardTitle>
          <CardDescription>Se abre en nueva pestaña — exactamente lo que vería el cliente final</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {portalCustomers.map((c) => (
              <button
                key={c.key}
                className="p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                disabled={loading}
                onClick={() => openPortal(c.key)}
              >
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.type}</div>
                <Badge variant="outline" className="mt-2 text-xs">{c.badge}</Badge>
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
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
