"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

const STATE_KEY = "audisec-demo-state";

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [stateStatus, setStateStatus] = useState<"loading" | "ok" | "lost" | "restoring">("loading");

  useEffect(() => {
    checkAndRestore();
  }, []);

  useEffect(() => {
    const interval = setInterval(syncStateToLocal, 5000);
    return () => clearInterval(interval);
  }, []);

  async function syncStateToLocal() {
    try {
      const res = await apiFetch("/api/state");
      const state = await res.json();
      if (state.setup_complete) {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
      }
    } catch {
      // silent
    }
  }

  async function checkAndRestore() {
    try {
      const res = await apiFetch("/api/state");
      const state = await res.json();
      if (state.setup_complete) {
        setStateStatus("ok");
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
        return;
      }

      const cached = localStorage.getItem(STATE_KEY);
      if (cached) {
        setStateStatus("lost");
      } else {
        setStateStatus("ok");
      }
    } catch {
      setStateStatus("ok");
    }
  }

  async function restore() {
    const cached = localStorage.getItem(STATE_KEY);
    if (!cached) return;
    setStateStatus("restoring");
    try {
      const res = await apiFetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: cached,
      });
      if (res.ok) {
        setStateStatus("ok");
      } else {
        setStateStatus("lost");
      }
    } catch {
      setStateStatus("lost");
    }
  }

  return (
    <>
      {stateStatus === "lost" && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-sm">
          <span className="text-amber-800">
            El servidor se ha reiniciado. Tu sesión anterior está guardada localmente.
          </span>
          <button
            onClick={restore}
            className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700"
          >
            Restaurar estado
          </button>
        </div>
      )}
      {stateStatus === "restoring" && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 text-sm text-blue-800">
          Restaurando estado...
        </div>
      )}
      {children}
    </>
  );
}
