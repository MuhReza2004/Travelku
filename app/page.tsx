"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  Booking,
  BookingStatus,
  BookingFormData,
  BookingFilters,
  PaginatedResponse,
  Staff,
} from "@/lib/types";
import { api } from "@/lib/api/client";
import { BookingSummary } from "@/components/bookings/booking-summary";
import { BookingFilters as BookingFiltersComponent } from "@/components/bookings/booking-filters";
import { BookingTable } from "@/components/bookings/booking-table";
import { BookingFormDialog } from "@/components/bookings/booking-form";
import { ConfirmDialog } from "@/components/bookings/confirm-dialog";

const PAGE_SIZE = 20;

const EMPTY_FILTERS: BookingFilters = {
  status: "",
  package_name: "",
  date_from: "",
  date_to: "",
  search: "",
  page: 0,
  page_size: PAGE_SIZE,
};

export default function HomePage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [filters, setFilters] = useState<BookingFilters>(EMPTY_FILTERS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [ready, setReady] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const buildUrl = useCallback((f: BookingFilters): string => {
    const params = new URLSearchParams();
    if (f.status) params.set("status", f.status);
    if (f.package_name) params.set("package_name", f.package_name);
    if (f.date_from) params.set("date_from", f.date_from);
    if (f.date_to) params.set("date_to", f.date_to);
    if (f.search) params.set("search", f.search);
    params.set("page", String(f.page));
    params.set("page_size", String(f.page_size));
    return `/bookings?${params.toString()}`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ data: Staff }>("/auth/me")
      .then((res) => {
        if (!cancelled) setStaff(res.data);
      })
      .catch(() => {
        if (!cancelled) router.push("/auth/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<PaginatedResponse<Booking>>(buildUrl(filters))
      .then((res) => {
        if (!cancelled) {
          setBookings(res.data);
          setTotal(res.total);
          setTotalPages(res.total_pages);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBookings([]);
          setTotal(0);
          setTotalPages(0);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [filters, buildUrl]);

  const updateFilters = useCallback(
    (patch: Partial<BookingFilters>) => {
      setFilters((prev) => ({ ...prev, ...patch, page: 0 }));
    },
    []
  );

  const goToPage = useCallback(
    (page: number) => {
      setFilters((prev) => ({ ...prev, page }));
    },
    []
  );

  const handleCreate = async (data: BookingFormData) => {
    try {
      await api.post("/bookings", data);
      setFilters((prev) => ({ ...prev, page: 0 }));
      setReady(false);
      return { success: true as const };
    } catch (err: unknown) {
      const e = err as Error & {
        errors?: { field: string; message: string }[];
      };
      return {
        success: false as const,
        errors: e.errors || [
          { field: "root", message: e.message || "Gagal menyimpan" },
        ],
      };
    }
  };

  const handleUpdate = async (data: BookingFormData) => {
    if (!editingBooking) return { success: false as const, errors: [] };
    try {
      await api.put(`/bookings/${editingBooking.id}`, data);
      setEditingBooking(undefined);
      setReady(false);
      return { success: true as const };
    } catch (err: unknown) {
      const e = err as Error & {
        errors?: { field: string; message: string }[];
      };
      return {
        success: false as const,
        errors: e.errors || [
          { field: "root", message: e.message || "Gagal menyimpan" },
        ],
      };
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/bookings/${deleteId}`);
    } catch {
      /* empty */
    }
    setDeleteLoading(false);
    setDeleteId(null);
    setReady(false);
  };

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    setStatusLoading(true);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
    } catch {
      /* empty */
    }
    setStatusLoading(false);
    setReady(false);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* empty */
    }
    router.push("/auth/login");
    router.refresh();
  };

  const startCreate = () => {
    setEditingBooking(undefined);
    setFormOpen(true);
  };

  const startEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setFormOpen(true);
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      "Nama Pemesan",
      "Kontak",
      "Paket Wisata",
      "Tanggal Keberangkatan",
      "Jumlah Peserta",
      "Harga Per Orang",
      "Total",
      "Status",
      "Catatan",
      "Dibuat",
    ];
    const rows = bookings.map((b) => [
      b.customer_name,
      b.contact,
      b.package_name,
      b.departure_date,
      b.participants,
      b.price_per_person,
      b.price_per_person * b.participants,
      b.status,
      b.notes,
      b.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pemesanan-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900">TravelKu</h1>
            <span className="hidden sm:inline text-sm text-zinc-400">|</span>
            <span className="hidden sm:inline text-sm text-zinc-500">
              Manajemen Pemesanan
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {staff && (
              <span className="hidden sm:inline text-sm text-zinc-500">{staff.name}</span>
            )}
            <button
              onClick={handleLogout}
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-800">
            Daftar Pemesanan
            {!ready && (
              <span className="ml-2 text-sm font-normal text-zinc-400">
                Memuat...
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={bookings.length === 0}
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-2 sm:px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export CSV"
            >
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden" aria-hidden="true">⬇</span>
            </button>
            <button
              onClick={startCreate}
              className="rounded-md bg-blue-600 px-3 py-2 sm:px-4 text-sm font-medium text-white hover:bg-blue-700 whitespace-nowrap"
            >
              <span className="sm:hidden">+ Baru</span>
              <span className="hidden sm:inline">+ Tambah Pemesanan</span>
            </button>
          </div>
        </div>

        <BookingSummary bookings={bookings} />

        <BookingFiltersComponent
          filters={filters}
          onFilterChange={(f) => {
            setReady(false);
            updateFilters(f);
          }}
        />

        {!ready ? (
          <div className="flex items-center justify-center py-12 text-zinc-400">
            Memuat data...
          </div>
        ) : (
          <>
            <BookingTable
              bookings={bookings}
              onEdit={startEdit}
              onDelete={(id) => setDeleteId(id)}
              onStatusChange={handleStatusChange}
              statusLoading={statusLoading}
            />

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-zinc-600">
                <span className="text-xs sm:text-sm">
                  {(filters.page * filters.page_size + 1)}–
                  {Math.min((filters.page + 1) * filters.page_size, total)} / {total}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(Math.max(0, filters.page - 1))}
                    disabled={filters.page === 0}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Sebelumnya
                  </button>
                  <button
                    onClick={() => goToPage(Math.min(totalPages - 1, filters.page + 1))}
                    disabled={filters.page >= totalPages - 1}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BookingFormDialog
        booking={editingBooking}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingBooking(undefined);
        }}
        onSubmit={editingBooking ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Hapus Pemesanan"
        message="Apakah Anda yakin ingin menghapus pemesanan ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
