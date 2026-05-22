"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  number: string | null;
  customer_name: string | null;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  lines: {
    description: string | null;
    amount: number;
    quantity: number | null;
    period: { start: string; end: string } | null;
  }[];
  tax: number;
  total: number;
  custom_fields: { name: string; value: string }[] | null;
}

export default function InvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  async function fetchInvoices() {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "all" ? `?contract=${filter}` : "";
      const res = await apiFetch(`/api/invoices${params}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const statusColor = (status: string | null) => {
    switch (status) {
      case "paid": return "default";
      case "open": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Cobros y confirmaciones — Stripe Invoices</h1>
        <p className="text-gray-600">
          Cada invoice de Stripe es una confirmación de cobro, no la factura legal. La factura legal la genera Business Central.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-sm">
        <div className="font-semibold text-indigo-900 mb-2">Arquitectura: Stripe + Business Central</div>
        <div className="flex items-center gap-2 text-indigo-800 font-mono text-xs flex-wrap">
          <span className="bg-indigo-100 px-2 py-1 rounded">Suscripción activa</span>
          <span>→</span>
          <span className="bg-indigo-100 px-2 py-1 rounded">Stripe cobra automáticamente</span>
          <span>→</span>
          <span className="bg-indigo-100 px-2 py-1 rounded">Webhook: invoice.paid</span>
          <span>→</span>
          <span className="bg-indigo-100 px-2 py-1 rounded">Business Central emite factura legal</span>
        </div>
        <p className="mt-2 text-indigo-700 text-xs">
          El invoice de Stripe lleva todos los metadatos (contrato, cliente final, CIF, centro de coste) que Business Central necesita para generar la factura fiscal sin intervención manual.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todos los contratos</option>
          <option value="contract1">Contrato 1 — Enterprise España</option>
          <option value="contract2">Contrato 2 — Multitenant LATAM</option>
          <option value="contract3">Contrato 3 — Plurianual Alemania</option>
          <option value="contract4">Contrato 4 — Partner Indirecto</option>
        </select>
        <Button onClick={fetchInvoices} disabled={loading}>
          {loading ? "Cargando..." : "Cargar cobros"}
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {invoices && invoices.length === 0 && (
        <div className="p-4 rounded bg-gray-100 text-gray-600 text-sm">
          No hay cobros generados aún. Crea suscripciones y avanza el tiempo para generar invoices.
        </div>
      )}

      {invoices && invoices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            {invoices.map((inv) => (
              <Card
                key={inv.id}
                className={`cursor-pointer hover:shadow-sm transition-shadow ${
                  selectedInvoice?.id === inv.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedInvoice(inv)}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{inv.customer_name}</div>
                    <Badge variant={statusColor(inv.status)}>{inv.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-gray-500">
                      {new Date(inv.created).toLocaleDateString("es-ES")}
                    </div>
                    <div className="font-mono text-sm font-medium">
                      {inv.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })} {inv.currency.toUpperCase()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedInvoice ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {selectedInvoice.number || selectedInvoice.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-gray-500">Cliente:</span> {selectedInvoice.customer_name}</div>
                    <div><span className="text-gray-500">Status:</span> {selectedInvoice.status}</div>
                    <div><span className="text-gray-500">Moneda:</span> {selectedInvoice.currency.toUpperCase()}</div>
                    <div><span className="text-gray-500">Fecha:</span> {new Date(selectedInvoice.created).toLocaleDateString("es-ES")}</div>
                  </div>

                  {selectedInvoice.custom_fields && selectedInvoice.custom_fields.length > 0 && (
                    <div className="p-3 rounded bg-gray-50">
                      <div className="font-medium mb-1">Campos personalizados:</div>
                      {selectedInvoice.custom_fields.map((f, i) => (
                        <div key={i} className="text-xs">
                          <span className="text-gray-500">{f.name}:</span> {f.value}
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <div className="font-medium mb-2">Line items:</div>
                    <div className="space-y-1">
                      {selectedInvoice.lines.map((line, i) => (
                        <div key={i} className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-700">{line.description || "—"}</span>
                          <span className="font-mono">
                            {line.amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })} {selectedInvoice.currency.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Subtotal + Tax ({selectedInvoice.tax.toLocaleString("es-ES", { minimumFractionDigits: 2 })})</span>
                    <span className="font-mono">
                      {selectedInvoice.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })} {selectedInvoice.currency.toUpperCase()}
                    </span>
                  </div>

                  {selectedInvoice.hosted_invoice_url && (
                    <a
                      href={selectedInvoice.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-600 hover:underline text-xs"
                    >
                      Ver invoice hosted →
                    </a>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Selecciona un cobro para ver el detalle
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
