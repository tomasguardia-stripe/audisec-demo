"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StripeKeyForm } from "@/components/stripe-key-form";
import { LogEntry } from "@/lib/types";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [phase, setPhase] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  async function runSetup() {
    setLoading(true);
    setError(null);
    setLogs([]);
    setSummary(null);
    setPhase(null);

    try {
      const res = await apiFetch("/api/setup", { method: "POST" });
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const dataLine = line.replace(/^data: /, "").trim();
          if (!dataLine) continue;

          try {
            const event = JSON.parse(dataLine);
            switch (event.type) {
              case "phase":
                setPhase(event.data);
                break;
              case "log":
                setLogs((prev) => [...prev, {
                  timestamp: new Date().toISOString(),
                  ...event.data,
                }]);
                break;
              case "done":
                setSummary(event.data);
                setPhase(null);
                break;
              case "error":
                setError(event.data);
                setPhase(null);
                break;
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  const actionColors: Record<string, string> = {
    "product.create": "bg-blue-100 text-blue-800",
    "price.create": "bg-purple-100 text-purple-800",
    "tax_rate.create": "bg-amber-100 text-amber-800",
    "coupon.create": "bg-green-100 text-green-800",
    "test_clock.create": "bg-cyan-100 text-cyan-800",
    "customer.create": "bg-indigo-100 text-indigo-800",
    "payment_method.attach": "bg-slate-100 text-slate-800",
    "portal.config.create": "bg-pink-100 text-pink-800",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Setup — Crear catálogo en Stripe</h1>
        <p className="text-gray-600">
          Un clic: crea todos los Productos, Precios, Tax Rates, Cupones, Test Clocks, y Clientes en el sandbox.
        </p>
      </div>

      <StripeKeyForm />

      <Card>
        <CardHeader>
          <CardTitle>Catálogo GlobalSuite Solutions</CardTitle>
          <CardDescription>
            Productos, precios multi-tier, 4 clientes con test clocks, tax rates, cupones, y Customer Portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded bg-gray-100">
              <div className="font-medium">Licencia base</div>
              <div className="text-gray-500">Core, Enterprise, Plus (1 producto, 3 precios)</div>
            </div>
            <div className="p-3 rounded bg-gray-100">
              <div className="font-medium">Módulos</div>
              <div className="text-gray-500">Risk, Compliance, Privacy, +6</div>
            </div>
            <div className="p-3 rounded bg-gray-100">
              <div className="font-medium">Frameworks</div>
              <div className="text-gray-500">Tier 1 (Standard), Tier 2 (Advanced)</div>
            </div>
            <div className="p-3 rounded bg-gray-100">
              <div className="font-medium">Multitenant</div>
              <div className="text-gray-500">Core, Enterprise, Plus + Entidad</div>
            </div>
            <div className="p-3 rounded bg-gray-100">
              <div className="font-medium">Add-Ons</div>
              <div className="text-gray-500">Usuarios, Conector, Almacenamiento</div>
            </div>
            <div className="p-3 rounded bg-gray-100">
              <div className="font-medium">Servicios</div>
              <div className="text-gray-500">Implantación, Formación (one-off)</div>
            </div>
          </div>

          <Button onClick={runSetup} disabled={loading || !!summary} size="lg" className="w-full">
            {summary ? "Catálogo creado" : loading ? "Creando..." : "Crear catálogo en Stripe"}
          </Button>

          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
              Error: {error}
            </div>
          )}

          {summary && (
            <div className="p-4 rounded bg-green-50 border border-green-200">
              <div className="font-medium text-green-900 mb-2">Setup completado</div>
              <div className="grid grid-cols-3 gap-2 text-sm text-green-800">
                <div>{summary.products} productos</div>
                <div>{summary.prices} precios</div>
                <div>{summary.tax_rates} tax rates</div>
                <div>{summary.coupons} cupones</div>
                <div>{summary.test_clocks} test clocks</div>
                <div>{summary.customers} clientes</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(logs.length > 0 || phase) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Operaciones en Stripe</CardTitle>
              {phase && (
                <Badge variant="secondary" className="animate-pulse">
                  {phase}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto space-y-1 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <span className="text-green-500 shrink-0">&#10003;</span>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${actionColors[log.action] || ""}`}>
                    {log.action}
                  </Badge>
                  <span className="text-gray-700">{log.detail}</span>
                  {log.stripe_id && (
                    <span className="text-gray-400 shrink-0">{log.stripe_id}</span>
                  )}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
