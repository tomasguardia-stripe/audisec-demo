"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getStoredKey, setStoredKey, clearStoredKey } from "@/lib/api-client";

export function StripeKeyForm() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredKey();
    if (stored) {
      setKey(stored);
      setSaved(true);
    }
  }, []);

  function handleSave() {
    setError(null);
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk_test_")) {
      setError("La clave debe empezar por sk_test_... (modo test)");
      return;
    }
    setStoredKey(trimmed);
    setSaved(true);
  }

  function handleClear() {
    clearStoredKey();
    setKey("");
    setSaved(false);
    setError(null);
  }

  if (saved) {
    return (
      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-green-900">Clave de Stripe configurada</div>
            <div className="text-xs text-green-700 font-mono mt-0.5">
              {key.slice(0, 12)}...{key.slice(-4)}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-green-700">
            Cambiar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Configura tu Stripe Sandbox</CardTitle>
        <CardDescription>
          Introduce tu clave secreta de test para conectar la demo a tu sandbox de Stripe.
          La clave se guarda solo en tu navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk_test_..."
            className="w-full px-3 py-2 border rounded-md text-sm font-mono bg-white"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} size="sm">
            Guardar clave
          </Button>
          <a
            href="https://dashboard.stripe.com/test/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Encontrar mi clave en el Dashboard →
          </a>
        </div>
        <p className="text-xs text-gray-500">
          Solo se aceptan claves de test (sk_test_...). La clave nunca sale de tu navegador salvo para las llamadas a la API de Stripe desde el servidor de esta demo.
        </p>
      </CardContent>
    </Card>
  );
}
