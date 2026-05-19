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
      <Card
        label="Total Pemesanan"
        value={totalBookings}
        color="text-zinc-900"
      />
      <Card
        label="Pendapatan"
        value={formatCurrency(totalRevenue)}
        highlight
      />
      <Card
        label="Menunggu"
        value={counts.Menunggu}
        color="text-amber-600"
        bg="bg-amber-50"
        dot="bg-amber-500"
      />
      <Card
        label="Dikonfirmasi"
        value={counts.Dikonfirmasi}
        color="text-blue-600"
        bg="bg-blue-50"
        dot="bg-blue-500"
      />
      <Card
        label="Selesai"
        value={counts.Selesai}
        color="text-emerald-600"
        bg="bg-emerald-50"
        dot="bg-emerald-500"
      />
      <Card
        label="Dibatalkan"
        value={counts.Dibatalkan}
        color="text-red-600"
        bg="bg-red-50"
        dot="bg-red-500"
      />
    </div>
  );
}

function Card({
  label,
  value,
  highlight,
  color,
  bg,
  dot,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  color?: string;
  bg?: string;
  dot?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-1.5 ${
        highlight
          ? "border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 dark:from-emerald-950 to-white dark:to-zinc-900"
          : bg
            ? `${bg} dark:bg-zinc-800/50 border-transparent`
            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
        <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p
        className={`font-bold leading-none ${
          highlight
            ? "text-emerald-800 dark:text-emerald-400 text-lg sm:text-xl"
            : color
              ? `${color} dark:text-zinc-100 text-lg sm:text-xl`
              : "text-zinc-900 dark:text-zinc-100 text-lg sm:text-xl"
        } ${typeof value === "string" && value.length > 18 ? "text-sm sm:text-base truncate" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
