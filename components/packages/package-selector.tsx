"use client";

import { useState } from "react";
import type { Package } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface PackageSelectorProps {
  packages: Package[];
  selectedId: string;
  onSelect: (pkg: Package | null) => void;
}

export function PackageSelector({
  packages,
  selectedId,
  onSelect,
}: PackageSelectorProps) {
  const [open, setOpen] = useState(false);

  const selected = packages.find((p) => p.id === selectedId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between gap-2"
      >
        <span className={selected ? "text-zinc-900" : "text-zinc-400"}>
          {selected ? selected.name : "Pilih paket wisata..."}
        </span>
        <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-50"
            >
              Kosongkan pilihan
            </button>
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => {
                  onSelect(pkg);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center justify-between ${
                  pkg.id === selectedId ? "bg-blue-50" : ""
                }`}
              >
                <div>
                  <span className="font-medium text-zinc-900">{pkg.name}</span>
                  <span className="ml-2 text-zinc-500">
                    {pkg.destination} · {pkg.duration}
                  </span>
                </div>
                <span className="text-xs text-zinc-400">
                  {formatCurrency(pkg.price)}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
