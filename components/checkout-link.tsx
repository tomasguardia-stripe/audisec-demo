"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

interface CheckoutLinkProps {
  contractKey: string;
  disabled?: boolean;
}

export function CheckoutLink({ contractKey, disabled }: CheckoutLinkProps) {
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract: contractKey }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckoutUrl(data.checkout_url);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (checkoutUrl) {
    return (
      <div className="p-4 rounded-lg bg-green-50 border border-green-200 space-y-2">
        <div className="text-sm font-medium text-green-900">Link de pago listo — enviar al cliente:</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={checkoutUrl}
            className="flex-1 text-xs font-mono bg-white border rounded px-3 py-2 text-gray-700"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => { navigator.clipboard.writeText(checkoutUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          >
            {copied ? "Copiado!" : "Copiar"}
          </Button>
          <Button size="sm" onClick={() => window.open(checkoutUrl, "_blank")}>
            Abrir como cliente →
          </Button>
        </div>
        <p className="text-xs text-green-700">
          El cliente abre este link, ve el desglose, introduce su IBAN o tarjeta, y paga. Tras el pago, la suscripción se activa y los cobros futuros son automáticos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Button onClick={generate} disabled={loading || disabled}>
        {loading ? "Generando..." : "Generar link de pago (Checkout)"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
