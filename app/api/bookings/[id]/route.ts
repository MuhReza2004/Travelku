import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { validateBooking } from "@/lib/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { id } = await params;

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Pemesanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { id } = await params;

  const body = await request.json();
  const errors = validateBooking(body);

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validasi gagal", errors }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({
      customer_name: body.customer_name.trim(),
      contact: body.contact.trim(),
      package_name: body.package_name.trim(),
      departure_date: body.departure_date,
      participants: Number(body.participants),
      price_per_person: Number(body.price_per_person),
      notes: body.notes?.trim() ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { id } = await params;

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { message: "Pemesanan berhasil dihapus" } });
}
