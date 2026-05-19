"use client";

import type { BookingStatus } from "@/lib/types";

interface BookingFiltersProps {
  filters: {
    status: BookingStatus | "";
    package_name: string;
    date_from: string;
    date_to: string;
    search: string;
  };
  onFilterChange: (filters: {
    status: BookingStatus | "";
    package_name: string;
    date_from: string;
    date_to: string;
    search: string;
  }) => void;
}

export function BookingFilters({ filters, onFilterChange }: BookingFiltersProps) {
  const set = (patch: Partial<typeof filters>) =>
    onFilterChange({ ...filters, ...patch });

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-zinc-500 mb-0.5 sm:mb-1">
            Cari
          </label>
          <input
            type="text"
            placeholder="Nama/kontak..."
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-zinc-500 mb-0.5 sm:mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              set({ status: e.target.value as BookingStatus | "" })
            }
            className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Dikonfirmasi">Dikonfirmasi</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-zinc-500 mb-0.5 sm:mb-1">
            Paket
          </label>
          <input
            type="text"
            placeholder="Cari paket..."
            value={filters.package_name}
            onChange={(e) => set({ package_name: e.target.value })}
            className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-zinc-500 mb-0.5 sm:mb-1">
            Dari
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => set({ date_from: e.target.value })}
            className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-zinc-500 mb-0.5 sm:mb-1">
            Sampai
          </label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => set({ date_to: e.target.value })}
            className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
