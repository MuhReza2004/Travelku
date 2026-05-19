"use client";

import { useEffect, useState } from "react";
import type { Booking, BookingFormData, Package } from "@/lib/types";
import { getTodayString, formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api/client";

interface BookingFormProps {
  booking?: Booking;
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: BookingFormData
  ) => Promise<{ success: boolean; errors?: { field: string; message: string }[] }>;
}

export function BookingFormDialog({
  booking,
  open,
  onClose,
  onSubmit,
}: BookingFormProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [customerName, setCustomerName] = useState(booking?.customer_name ?? "");
  const [contact, setContact] = useState(booking?.contact ?? "");
  const [packageId, setPackageId] = useState(booking?.package_id ?? "");
  const [packageName, setPackageName] = useState(booking?.package_name ?? "");
  const [departureDate, setDepartureDate] = useState(
    booking?.departure_date ?? ""
  );
  const [participants, setParticipants] = useState(
    booking?.participants.toString() ?? ""
  );
  const [pricePerPerson, setPricePerPerson] = useState(
    booking?.price_per_person.toString() ?? ""
  );
  const [notes, setNotes] = useState(booking?.notes ?? "");
  const [errors, setErrors] = useState<{ field: string; message: string }[]>(
    []
  );
  const [submitting, setSubmitting] = useState(false);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);

  useEffect(() => {
    if (open) {
      api
        .get<{ data: Package[] }>("/packages")
        .then((res) => setPackages(res.data))
        .catch(() => setPackages([]));
    }
  }, [open]);

  if (!open) return null;

  const getError = (field: string) =>
    errors.find((e) => e.field === field)?.message;

  const selectPackage = (pkg: Package | null) => {
    if (pkg) {
      setPackageId(pkg.id);
      setPackageName(pkg.name);
      setPricePerPerson(pkg.price.toString());
    } else {
      setPackageId("");
      setPackageName("");
    }
    setShowPackageDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    const result = await onSubmit({
      customer_name: customerName,
      contact,
      package_id: packageId,
      package_name: packageName,
      departure_date: departureDate,
      participants: parseInt(participants) || 0,
      price_per_person: parseFloat(pricePerPerson) || 0,
      notes,
    });

    setSubmitting(false);

    if (result.success) {
      onClose();
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
      <div className="w-full max-w-lg mx-4 rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {booking ? "Edit Pemesanan" : "Tambah Pemesanan Baru"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {getError("root") && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800">
            {getError("root")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="customer_name" error={!!getError("customer_name")}>
                Nama Pemesan
              </Label>
              <input
                id="customer_name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass(!!getError("customer_name"))}
              />
              {getError("customer_name") && (
                <FieldErrorMsg message={getError("customer_name")!} />
              )}
            </div>

            <div>
              <Label htmlFor="contact" error={!!getError("contact")}>
                Kontak (Telepon/Email)
              </Label>
              <input
                id="contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className={inputClass(!!getError("contact"))}
              />
              {getError("contact") && (
                <FieldErrorMsg message={getError("contact")!} />
              )}
            </div>

            <div className="relative">
              <Label htmlFor="package_name" error={!!getError("package_name")}>
                Paket Wisata
              </Label>
              <button
                type="button"
                onClick={() => setShowPackageDropdown(!showPackageDropdown)}
                className={`w-full rounded-md border px-3 py-2 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getError("package_name") ? "border-red-400 dark:border-red-500" : "border-zinc-300 dark:border-zinc-600"
                } bg-white dark:bg-zinc-800`}
              >
                <span className={packageName ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}>
                  {packageName || "Pilih paket atau ketik manual..."}
                </span>
                <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {getError("package_name") && (
                <FieldErrorMsg message={getError("package_name")!} />
              )}

              {showPackageDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPackageDropdown(false)} />
                  <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg max-h-48 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="Ketik manual..."
                      value={packageName}
                      onChange={(e) => {
                        setPackageId("");
                        setPackageName(e.target.value);
                      }}
                      className="w-full border-b border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      autoFocus
                    />
                    {packages.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500">Tidak ada paket</p>
                    ) : (
                      packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => selectPackage(pkg)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center justify-between ${
                            pkg.id === packageId ? "bg-blue-50 dark:bg-blue-900/30" : ""
                          }`}
                        >
                          <div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{pkg.name}</span>
                            <span className="ml-2 text-zinc-500 dark:text-zinc-400 text-xs">
                              {pkg.destination} · {pkg.duration}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {formatCurrency(pkg.price)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div>
              <Label htmlFor="departure_date" error={!!getError("departure_date")}>
                Tanggal Keberangkatan
              </Label>
              <input
                id="departure_date"
                type="date"
                value={departureDate}
                min={getTodayString()}
                onChange={(e) => setDepartureDate(e.target.value)}
                className={inputClass(!!getError("departure_date"))}
              />
              {getError("departure_date") && (
                <FieldErrorMsg message={getError("departure_date")!} />
              )}
            </div>

            <div>
              <Label htmlFor="participants" error={!!getError("participants")}>
                Jumlah Peserta
              </Label>
              <input
                id="participants"
                type="number"
                min="1"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className={inputClass(!!getError("participants"))}
              />
              {getError("participants") && (
                <FieldErrorMsg message={getError("participants")!} />
              )}
            </div>

            <div>
              <Label htmlFor="price_per_person" error={!!getError("price_per_person")}>
                Harga Per Orang (Rp)
              </Label>
              <input
                id="price_per_person"
                type="number"
                min="0"
                value={pricePerPerson}
                onChange={(e) => setPricePerPerson(e.target.value)}
                className={inputClass(!!getError("price_per_person"))}
              />
              {getError("price_per_person") && (
                <FieldErrorMsg message={getError("price_per_person")!} />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : booking ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({
  htmlFor,
  error,
  children,
}: {
  htmlFor: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-1 block text-sm font-medium ${
        error ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300"
      }`}
    >
      {children}
    </label>
  );
}

function FieldErrorMsg({ message }: { message: string }) {
  return <p className="mt-1 text-xs text-red-600 dark:text-red-400">{message}</p>;
}

function inputClass(error: boolean) {
  return `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
    error ? "border-red-400 dark:border-red-500 ring-red-300" : "border-zinc-300 dark:border-zinc-600"
  }`;
}
