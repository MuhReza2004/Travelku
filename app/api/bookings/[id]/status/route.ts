import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

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

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json(
      { error: "Pemesanan tidak ditemukan" },
      { status: 404 }
    );
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

  return NextResponse.json({ data });
}
