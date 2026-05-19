import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/lib/types";

interface BookingSummaryProps {
  bookings: Booking[];
}

export function BookingSummary({ bookings }: BookingSummaryProps) {
  const totalBookings = bookings.length;
  const revenueBookings = bookings.filter(
    (b) => b.status === "Dikonfirmasi" || b.status === "Selesai"
  );
  const totalRevenue = revenueBookings.reduce(
    (sum, b) => sum + b.price_per_person * b.participants,
    0
  );

  const counts = {
    Menunggu: bookings.filter((b) => b.status === "Menunggu").length,
    Dikonfirmasi: bookings.filter((b) => b.status === "Dikonfirmasi").length,
    Selesai: bookings.filter((b) => b.status === "Selesai").length,
    Dibatalkan: bookings.filter((b) => b.status === "Dibatalkan").length,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <SummaryCard label="Total" value={totalBookings} />
      <SummaryCard
        label="Pendapatan"
        value={formatCurrency(totalRevenue)}
        highlight
      />
      <SummaryCard
        label="Menunggu"
        value={counts.Menunggu}
        color="text-amber-600"
      />
      <SummaryCard
        label="Dikonfirmasi"
        value={counts.Dikonfirmasi}
        color="text-blue-600"
      />
      <SummaryCard
        label="Selesai"
        value={counts.Selesai}
        color="text-emerald-600"
      />
      <SummaryCard
        label="Dibatalkan"
        value={counts.Dibatalkan}
        color="text-red-600"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4">
      <p className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`mt-0.5 sm:mt-1 text-lg sm:text-xl lg:text-2xl font-bold leading-tight ${
          highlight ? "text-emerald-700" : color ?? "text-zinc-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
