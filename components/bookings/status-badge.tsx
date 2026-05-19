import type { BookingStatus } from "@/lib/types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  Menunggu: "bg-amber-100 text-amber-800 ring-amber-300",
  Dikonfirmasi: "bg-blue-100 text-blue-800 ring-blue-300",
  Selesai: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  Dibatalkan: "bg-red-100 text-red-800 ring-red-300",
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
    return <span className="text-xs text-zinc-400">—</span>;
  }

  return (
    <div className="flex gap-1">
      {transitions.map((next) => (
        <button
          key={next}
          onClick={() => onStatusChange(next)}
          disabled={loading}
          className="rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-zinc-100 enabled:active:bg-zinc-200 ring-1 ring-inset ring-zinc-300"
        >
          → {next}
        </button>
      ))}
    </div>
  );
}
