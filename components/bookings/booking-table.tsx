"use client";

import type { Booking, BookingStatus } from "@/lib/types";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { StatusBadge, StatusActions } from "./status-badge";

interface BookingTableProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
  statusLoading?: boolean;
}

export function BookingTable({
  bookings,
  onEdit,
  onDelete,
  onStatusChange,
  statusLoading,
}: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
        <p className="text-zinc-500">Belum ada pemesanan.</p>
        <p className="mt-1 text-sm text-zinc-400">
          Klik &quot;Tambah Pemesanan&quot; untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-[600px] w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
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
        <tbody className="divide-y divide-zinc-100 bg-white">
          {bookings.map((booking) => {
            const total = booking.price_per_person * booking.participants;
            return (
              <tr key={booking.id} className="hover:bg-zinc-50">
                <Td className="font-medium text-zinc-900">
                  {booking.customer_name}
                </Td>
                <Td className="hidden sm:table-cell text-zinc-600">
                  {booking.contact}
                </Td>
                <Td className="font-medium text-zinc-800">
                  {booking.package_name}
                </Td>
                <Td>{formatDateShort(booking.departure_date)}</Td>
                <Td className="hidden md:table-cell">
                  {booking.participants}
                </Td>
                <Td className="hidden lg:table-cell">
                  {formatCurrency(booking.price_per_person)}
                </Td>
                <Td className="font-semibold text-zinc-900">
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
                    <button
                      onClick={() => onEdit(booking)}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(booking.id)}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
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
      className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 ${className ?? ""}`}
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
