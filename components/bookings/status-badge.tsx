import type { BookingStatus } from "@/lib/types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  Menunggu: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 ring-amber-300 dark:ring-amber-700",
  Dikonfirmasi: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 ring-blue-300 dark:ring-blue-700",
  Selesai: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 ring-emerald-300 dark:ring-emerald-700",
  Dibatalkan: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 ring-red-300 dark:ring-red-700",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  Menunggu: ["Dikonfirmasi", "Dibatalkan"],
  Dikonfirmasi: ["Selesai", "Dibatalkan"],
  Selesai: [],
  Dibatalkan: [],
};

interface StatusActionsProps {
  status: BookingStatus;
  onStatusChange: (newStatus: BookingStatus) => void;
  loading?: boolean;
}

export function StatusActions({
  status,
  onStatusChange,
  loading,
}: StatusActionsProps) {
  const transitions = ALLOWED_TRANSITIONS[status];

  if (transitions.length === 0) {
    return <span className="text-xs text-zinc-400 dark:text-zinc-500">—</span>;
  }

  return (
    <div className="flex gap-1">
      {transitions.map((next) => (
        <button
          key={next}
          onClick={() => onStatusChange(next)}
          disabled={loading}
          className="rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-zinc-100 dark:enabled:hover:bg-zinc-800 enabled:active:bg-zinc-200 dark:enabled:active:bg-zinc-700 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600 text-zinc-700 dark:text-zinc-300"
        >
          → {next}
        </button>
      ))}
    </div>
  );
}
