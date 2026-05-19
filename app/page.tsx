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
import { formatDateShort, formatDateTime } from "@/lib/utils";
import { BookingSummary } from "@/components/bookings/booking-summary";
import { BookingFilters as BookingFiltersComponent } from "@/components/bookings/booking-filters";
import { BookingTable } from "@/components/bookings/booking-table";
import { BookingFormDialog } from "@/components/bookings/booking-form";
import { ConfirmDialog } from "@/components/bookings/confirm-dialog";
import { AuditLogDialog } from "@/components/bookings/audit-log-dialog";
import { PackagesTab } from "@/components/packages/packages-tab";
import { ThemeToggle } from "@/components/theme-toggle";

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

type Tab = "bookings" | "packages";

export default function HomePage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [tab, setTab] = useState<Tab>("bookings");
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [logBookingId, setLogBookingId] = useState<string | null>(null);
  const [logBookingName, setLogBookingName] = useState("");

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
    if (tab !== "bookings") return;
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
  }, [filters, buildUrl, tab, refreshKey]);

  const updateFilters = useCallback(
    (patch: Partial<BookingFilters>) => {
      setFilters((prev) => ({ ...prev, ...patch, page: 0 }));
    },
    []
  );

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleCreate = async (data: BookingFormData) => {
    try {
      await api.post("/bookings", data);
      setFilters((prev) => ({ ...prev, page: 0 }));
      setReady(false);
      return { success: true as const };
    } catch (err: unknown) {
      const e = err as Error & { errors?: { field: string; message: string }[] };
      return {
        success: false as const,
        errors: e.errors || [{ field: "root", message: e.message || "Gagal menyimpan" }],
      };
    }
  };

  const handleUpdate = async (data: BookingFormData) => {
    if (!editingBooking) return { success: false as const, errors: [] };
    try {
      await api.put(`/bookings/${editingBooking.id}`, data);
      setEditingBooking(undefined);
      setReady(false);
      setRefreshKey((k) => k + 1);
      return { success: true as const };
    } catch (err: unknown) {
      const e = err as Error & { errors?: { field: string; message: string }[] };
      return {
        success: false as const,
        errors: e.errors || [{ field: "root", message: e.message || "Gagal menyimpan" }],
      };
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/bookings/${deleteId}`);
    } catch { /* empty */ }
    setDeleteLoading(false);
    setDeleteId(null);
    setRefreshKey((k) => k + 1);
  };

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    setStatusLoading(true);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
    } catch { /* empty */ }
    setStatusLoading(false);
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch { /* empty */ }
    router.push("/auth/login");
    router.refresh();
  };

  const handleExportExcel = () => {
    if (bookings.length === 0) return;

    import("xlsx").then((XLSX) => {
      const data = bookings.map((b) => ({
        "Nama Pemesan": b.customer_name,
        Kontak: b.contact,
        "Paket Wisata": b.package_name,
        "Tanggal Keberangkatan": formatDateShort(b.departure_date),
        "Jumlah Peserta": b.participants,
        "Harga Per Orang": b.price_per_person,
        Total: b.price_per_person * b.participants,
        Status: b.status,
        Catatan: b.notes || "",
        Dibuat: formatDateTime(b.created_at),
      }));

      const ws = XLSX.utils.json_to_sheet(data);

      const colWidths = [
        { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 18 },
        { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
        { wch: 20 }, { wch: 18 },
      ];
      ws["!cols"] = colWidths;

      const headerCells = ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1", "J1"];
      for (const cell of headerCells) {
        const ref = ws[cell];
        if (ref) ref.s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
          fill: { fgColor: { rgb: "2563EB" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" },
          },
        };
      }

      const range = XLSX.utils.decode_range(ws["!ref"] || "A1:J1");
      for (let r = range.s.r + 1; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = ws[addr];
          if (cell) {
            cell.s = {
              alignment: { horizontal: c >= 4 && c <= 6 ? "right" : "left", vertical: "center" },
              border: {
                top: { style: "thin" }, bottom: { style: "thin" },
                left: { style: "thin" }, right: { style: "thin" },
              },
            };
            if (typeof cell.v === "number") {
              cell.t = "n";
              cell.z = c === 5 || c === 6 ? '#,##0' : '0';
            }
          }
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pemesanan");
      XLSX.writeFile(wb, `pemesanan-${new Date().toISOString().split("T")[0]}.xlsx`);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">TravelKu</h1>
            </div>
            <nav className="flex gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5" role="tablist">
              <button
                onClick={() => setTab("bookings")}
                role="tab"
                aria-selected={tab === "bookings"}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  tab === "bookings"
                    ? "bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Pemesanan
              </button>
              <button
                onClick={() => setTab("packages")}
                role="tab"
                aria-selected={tab === "packages"}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  tab === "packages"
                    ? "bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Paket Wisata
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {staff && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{staff.name}</span>
                  {staff.role === "admin" && (
                    <span className="rounded bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                      admin
                    </span>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {tab === "bookings" ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  Daftar Pemesanan
                  {total > 0 && (
                    <span className="ml-2 text-sm font-normal text-zinc-400 dark:text-zinc-500">
                      {ready ? `${total} pemesanan` : "Memuat..."}
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  disabled={bookings.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Export Excel"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span className="hidden sm:inline">Export Excel</span>
                </button>
                <button
                  onClick={() => { setEditingBooking(undefined); setFormOpen(true); }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span> Tambah</span>
                </button>
              </div>
            </div>

            <BookingSummary bookings={bookings} />

            <BookingFiltersComponent
              filters={filters}
              onFilterChange={(f) => { setReady(false); updateFilters(f); }}
            />

            {!ready ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-500">
                <svg className="w-8 h-8 mb-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm">Memuat data...</p>
              </div>
            ) : (
              <>
                <BookingTable
                  bookings={bookings}
                  onEdit={(booking) => { setEditingBooking(booking); setFormOpen(true); }}
                  onDelete={(id) => setDeleteId(id)}
                  onStatusChange={handleStatusChange}
                  onViewLogs={(b) => { setLogBookingId(b.id); setLogBookingName(b.customer_name); }}
                  statusLoading={statusLoading}
                />

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      Menampilkan {filters.page * filters.page_size + 1}–
                      {Math.min((filters.page + 1) * filters.page_size, total)} dari {total}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToPage(Math.max(0, filters.page - 1))}
                        disabled={filters.page === 0}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Sebelumnya
                      </button>
                      <button
                        onClick={() => goToPage(Math.min(totalPages - 1, filters.page + 1))}
                        disabled={filters.page >= totalPages - 1}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Selanjutnya
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <PackagesTab
              staffRole={staff?.role ?? "staff"}
            />
          </>
        )}
      </main>

      <BookingFormDialog
        key={editingBooking?.id ?? "create"}
        booking={editingBooking}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingBooking(undefined); }}
        onSubmit={editingBooking ? handleUpdate : handleCreate}
      />

      <AuditLogDialog
        key={logBookingId ?? "closed"}
        bookingId={logBookingId ?? ""}
        bookingName={logBookingName}
        open={logBookingId !== null}
        onClose={() => setLogBookingId(null)}
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
