"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface InvoiceLinkProps {
  url: string;
}

export function InvoiceLink({ url }: InvoiceLinkProps) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="p-4 rounded-lg bg-green-50 border border-green-200 space-y-2">
      <div className="text-sm font-medium text-green-900">Invoice listo — enviar al cliente para que pague:</div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 text-xs font-mono bg-white border rounded px-3 py-2 text-gray-700"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        >
          {copied ? "Copiado!" : "Copiar"}
        </Button>
        <Button size="sm" onClick={() => window.open(url, "_blank")}>
          Ver como cliente →
        </Button>
      </div>
      <p className="text-xs text-green-700">
        El cliente abre este link, ve el desglose, elige método de pago (SEPA/tarjeta/transferencia), y paga. Tras el pago, la suscripción se activa y los cobros futuros son automáticos.
      </p>
    </div>
  );
}
