"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { LogEntry } from "@/lib/types";

export function ActivityLog({ logs }: { logs: LogEntry[] }) {
  if (logs.length === 0) return null;

  return (
    <ScrollArea className="h-64 w-full rounded border bg-gray-900 p-4">
      <div className="space-y-1 font-mono text-xs">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-green-400 shrink-0">✓</span>
            <span className="text-gray-400 shrink-0">
              {log.action}
            </span>
            <span className="text-gray-100">{log.detail}</span>
            {log.stripe_id && (
              <span className="text-blue-400 shrink-0">({log.stripe_id})</span>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
