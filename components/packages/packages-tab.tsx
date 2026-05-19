"use client";

import { useEffect, useRef, useState } from "react";
import type { Package } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api/client";
import { PackageFormDialog } from "./package-form";

interface PackagesTabProps {
  staffRole: "admin" | "staff";
}

export function PackagesTab({ staffRole }: PackagesTabProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    api
      .get<{ data: Package[] }>("/packages")
      .then((res) => {
        if (mountedRef.current) setPackages(res.data);
      })
      .catch(() => {
        if (mountedRef.current) setPackages([]);
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = async () => {
    try {
      const res = await api.get<{ data: Package[] }>("/packages");
      if (mountedRef.current) setPackages(res.data);
    } catch {
      if (mountedRef.current) setPackages([]);
    }
  };

  const handleCreate = async (data: {
    name: string;
    destination: string;
    duration: string;
    description: string;
    capacity: number;
    price: number;
  }) => {
    try {
      await api.post("/packages", data);
      await refresh();
      return { success: true as const };
    } catch (err: unknown) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : "Gagal menyimpan",
      };
    }
  };

  const handleUpdate = async (data: {
    name: string;
    destination: string;
    duration: string;
    description: string;
    capacity: number;
    price: number;
  }) => {
    if (!editingPkg) return { success: false as const, error: "" };
    try {
      await api.put(`/packages/${editingPkg.id}`, data);
      setEditingPkg(undefined);
      await refresh();
      return { success: true as const };
    } catch (err: unknown) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : "Gagal menyimpan",
      };
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/packages/${deleteId}`);
    } catch {
      /* empty */
    }
    setDeleteId(null);
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{packages.length} paket tersedia</p>
        <button
          onClick={() => {
            setEditingPkg(undefined);
            setFormOpen(true);
          }}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Tambah Paket
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
          <p className="text-zinc-500">Belum ada paket wisata.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Klik &quot;Tambah Paket&quot; untuk memulai.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="min-w-[500px] w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <Th>Nama Paket</Th>
                <Th>Destinasi</Th>
                <Th>Durasi</Th>
                <Th>Kapasitas</Th>
                <Th>Harga</Th>
                {staffRole === "admin" && <Th className="text-right">Aksi</Th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-zinc-50">
                  <Td className="font-medium text-zinc-900">{pkg.name}</Td>
                  <Td>{pkg.destination}</Td>
                  <Td>{pkg.duration}</Td>
                  <Td>{pkg.capacity} orang</Td>
                  <Td className="font-semibold">{formatCurrency(pkg.price)}</Td>
                  {staffRole === "admin" && (
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingPkg(pkg);
                            setFormOpen(true);
                          }}
                          className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(pkg.id)}
                          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PackageFormDialog
        pkg={editingPkg}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPkg(undefined);
        }}
        onSubmit={editingPkg ? handleUpdate : handleCreate}
      />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm mx-4 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-900">Hapus Paket</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Apakah Anda yakin ingin menghapus paket ini?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
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
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 ${className ?? ""}`}
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
    <td className={`whitespace-nowrap px-4 py-3 ${className ?? ""}`}>
      {children}
    </td>
  );
}
