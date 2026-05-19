"use client";

import { useEffect, useRef, useState } from "react";
import type { BookingAuditLog } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { api } from "@/lib/api/client";

interface AuditLogDialogProps {
  bookingId: string;
  bookingName: string;
  open: boolean;
  onClose: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  created: "Dibuat",
  updated: "Diubah",
  status_changed: "Status Diubah",
  deleted: "Dihapus",
};

export function AuditLogDialog({
  bookingId,
  bookingName,
  open,
  onClose,
}: AuditLogDialogProps) {
  const [logs, setLogs] = useState<BookingAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!open) return;
    mountedRef.current = true;
    api
      .get<{ data: BookingAuditLog[] }>(`/bookings/${bookingId}/logs`)
      .then((res) => { if (mountedRef.current) setLogs(res.data); })
      .catch(() => { if (mountedRef.current) setLogs([]); })
      .finally(() => { if (mountedRef.current) setLoading(false); });
    return () => { mountedRef.current = false; };
  }, [open, bookingId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl mx-4 rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Riwayat Pemesanan</h2>
            <p className="text-sm text-zinc-500 mt-0.5">{bookingName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:text-zinc-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-zinc-400">
            Memuat riwayat...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center">
            <p className="text-zinc-500">Belum ada riwayat.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {logs.map((log, i) => (
              <div key={log.id} className="relative flex gap-4 pb-6">
                {i < logs.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-zinc-200" />
                )}
                <div className="flex shrink-0 flex-col items-center">
                  <div className={`h-5 w-5 rounded-full ring-2 ring-white ${
                    log.action === "created" ? "bg-blue-500" :
                    log.action === "status_changed" ? "bg-amber-500" :
                    log.action === "deleted" ? "bg-red-500" :
                    "bg-zinc-400"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-900">
                      {ACTION_LABELS[log.action] || log.action}
                    </p>
                    <span className="shrink-0 text-xs text-zinc-400">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    oleh {log.staff_name || "Unknown"}
                  </p>
                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <div className="mt-1.5 rounded-md bg-zinc-50 p-2 text-xs text-zinc-600 space-y-0.5">
                      {log.action === "status_changed" ? (
                        <p>
                          {log.changes.from as string} → {log.changes.to as string}
                        </p>
                      ) : log.action === "updated" && log.changes.before ? (
                        <>
                          {(Object.keys(log.changes.before as Record<string, unknown>)).map((key) => {
                            const before = (log.changes.before as Record<string, unknown>)[key];
                            const after = (log.changes.after as Record<string, unknown>)?.[key];
                            return (
                              <p key={key}>
                                {key.replace(/_/g, " ")}: {String(before ?? "—")} → {String(after ?? "—")}
                              </p>
                            );
                          })}
                        </>
                      ) : (
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
