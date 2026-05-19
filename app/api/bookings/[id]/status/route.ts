import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";
import { createAuditLog, getStaffRole } from "@/lib/helpers/audit";

const VALID_STATUSES: BookingStatus[] = [
  "Menunggu",
  "Dikonfirmasi",
  "Selesai",
  "Dibatalkan",
];

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  Menunggu: ["Dikonfirmasi", "Dibatalkan"],
  Dikonfirmasi: ["Selesai", "Dibatalkan"],
  Selesai: [],
  Dibatalkan: [],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { id } = await params;
  const { status: newStatus } = await request.json();

  if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getStaffRole(supabase, user.id);

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("status, created_by")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: "Pemesanan tidak ditemukan" }, { status: 404 });
  }

  if (role !== "admin" && booking.created_by !== user.id) {
    return NextResponse.json({ error: "Anda tidak memiliki akses" }, { status: 403 });
  }

  const currentStatus = booking.status as BookingStatus;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      {
        error: `Tidak bisa mengubah status dari "${currentStatus}" ke "${newStatus}"`,
      },
      { status: 400 }
    );
  }

  const { data, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await createAuditLog(supabase, id, user.id, "status_changed", {
    from: currentStatus,
    to: newStatus,
  });

  return NextResponse.json({ data });
}
