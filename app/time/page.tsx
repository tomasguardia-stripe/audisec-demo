"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityLog } from "@/components/activity-log";
import { LogEntry } from "@/lib/types";

interface ClockInfo {
  id: string;
  name: string;
  frozen_time: string;
  status: string;
}

export default function TimePage() {
  const [loading, setLoading] = useState(false);
  const [clocks, setClocks] = useState<Record<string, ClockInfo> | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchClocks() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/time");
      const data = await res.json();
      if (data.success) {
        setClocks(data.clocks);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function advanceClock(contract: string, days: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract, advance_days: days }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => [...prev, ...data.logs]);
        await fetchClocks();
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const contractLabels: Record<string, string> = {
    contract1: "Enterprise España",
    contract2: "Multitenant LATAM",
    contract3: "Plurianual Alemania",
    contract4: "Partner Indirecto",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Test Clocks — Simular paso del tiempo</h1>
        <p className="text-gray-600">
          Cada contrato tiene su propio Test Clock. Avanzar el tiempo genera cobros, transiciones de fase, y renovaciones.
        </p>
      </div>

      <Button onClick={fetchClocks} disabled={loading}>
        {clocks ? "Actualizar estado" : "Cargar Test Clocks"}
      </Button>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {clocks && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(clocks).map(([key, clock]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{contractLabels[key] || key}</CardTitle>
                  <Badge variant={clock.status === "ready" ? "default" : "secondary"}>
                    {clock.status}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs">{clock.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-500">Hora congelada: </span>
                  <span className="font-mono">
                    {new Date(clock.frozen_time).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    onClick={() => advanceClock(key, 30)}
                  >
                    +1 mes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    onClick={() => advanceClock(key, 180)}
                  >
                    +6 meses
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    onClick={() => advanceClock(key, 366)}
                  >
                    +1 año
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de avances</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLog logs={logs} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
