"use client";

import type { Booking, BookingStatus } from "@/lib/types";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { StatusBadge, StatusActions } from "./status-badge";

interface BookingTableProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onViewLogs?: (booking: Booking) => void;
  statusLoading?: boolean;
}

export function BookingTable({
  bookings,
  onEdit,
  onDelete,
  onStatusChange,
  onViewLogs,
  statusLoading,
}: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Belum ada pemesanan.</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          Klik &quot;Tambah Pemesanan&quot; untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-[600px] w-full divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <Th>Pemesan</Th>
            <Th className="hidden sm:table-cell">Kontak</Th>
            <Th>Paket</Th>
            <Th>Berangkat</Th>
            <Th className="hidden md:table-cell">Peserta</Th>
            <Th className="hidden lg:table-cell">Harga/Org</Th>
            <Th>Total</Th>
            <Th>Status</Th>
            <Th>Aksi Status</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700 bg-white dark:bg-zinc-900">
          {bookings.map((booking) => {
            const total = booking.price_per_person * booking.participants;
            return (
              <tr key={booking.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <Td className="font-medium text-zinc-900 dark:text-zinc-100">
                  {booking.customer_name}
                </Td>
                <Td className="hidden sm:table-cell text-zinc-600 dark:text-zinc-400">
                  {booking.contact}
                </Td>
                <Td className="font-medium text-zinc-800 dark:text-zinc-200">
                  {booking.package_name}
                </Td>
                <Td className="text-zinc-600 dark:text-zinc-300">{formatDateShort(booking.departure_date)}</Td>
                <Td className="hidden md:table-cell text-zinc-600 dark:text-zinc-300">
                  {booking.participants}
                </Td>
                <Td className="hidden lg:table-cell text-zinc-600 dark:text-zinc-300">
                  {formatCurrency(booking.price_per_person)}
                </Td>
                <Td className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(total)}
                </Td>
                <Td>
                  <StatusBadge status={booking.status} />
                </Td>
                <Td>
                  <StatusActions
                    status={booking.status}
                    onStatusChange={(s) => onStatusChange(booking.id, s)}
                    loading={statusLoading}
                  />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    {onViewLogs && (
                      <button
                        onClick={() => onViewLogs(booking)}
                        className="rounded px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        Log
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(booking)}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(booking.id)}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      Hapus
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`whitespace-nowrap px-3 py-3 ${className ?? ""}`}>
      {children}
    </td>
  );
}
