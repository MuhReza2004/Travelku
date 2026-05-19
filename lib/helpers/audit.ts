import { createServerClient } from "@supabase/ssr";
import type { AuditAction } from "@/lib/types";

export async function createAuditLog(
  supabase: ReturnType<typeof createServerClient>,
  bookingId: string,
  staffId: string,
  action: AuditAction,
  changes: Record<string, unknown> = {}
) {
  await supabase.from("booking_audit_logs").insert({
    booking_id: bookingId,
    staff_id: staffId,
    action,
    changes,
  });
}

export async function checkPackageCapacity(
  supabase: ReturnType<typeof createServerClient>,
  packageId: string,
  departureDate: string,
  newParticipants: number,
  excludeBookingId?: string
): Promise<string | null> {
  const { data: pkg } = await supabase
    .from("packages")
    .select("capacity")
    .eq("id", packageId)
    .single();

  if (!pkg) return "Paket wisata tidak ditemukan";

  let query = supabase
    .from("bookings")
    .select("participants")
    .eq("package_id", packageId)
    .eq("departure_date", departureDate)
    .in("status", ["Menunggu", "Dikonfirmasi", "Selesai"]);

  if (excludeBookingId) {
    query = query.neq("id", excludeBookingId);
  }

  const { data: existing } = await query;

  const used = (existing ?? []).reduce(
    (sum: number, b: { participants: number }) => sum + b.participants,
    0
  );

  if (used + newParticipants > pkg.capacity) {
    const remaining = pkg.capacity - used;
    return `Kapasitas paket tidak mencukupi. Sisa kuota: ${remaining} peserta`;
  }

  return null;
}

export async function getStaffRole(
  supabase: ReturnType<typeof createServerClient>,
  staffId: string
): Promise<"admin" | "staff"> {
  const { data } = await supabase
    .from("staff")
    .select("role")
    .eq("id", staffId)
    .single();
  return data?.role ?? "staff";
}
