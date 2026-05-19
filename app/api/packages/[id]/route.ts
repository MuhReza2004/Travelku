import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getStaffRole } from "@/lib/helpers/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { id } = await params;

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getStaffRole(supabase, user.id);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang bisa mengubah paket" }, { status: 403 });
  }

  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Nama paket wajib diisi" }, { status: 400 });
  }
  const capacity = Number(body.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) {
    return NextResponse.json({ error: "Kapasitas minimal 1" }, { status: 400 });
  }
  const price = Number(body.price);
  if (isNaN(price) || price < 0) {
    return NextResponse.json({ error: "Harga tidak boleh negatif" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("packages")
    .update({
      name: body.name.trim(),
      destination: body.destination.trim(),
      duration: body.duration.trim(),
      description: body.description?.trim() ?? "",
      capacity,
      price,
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getStaffRole(supabase, user.id);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang bisa menghapus paket" }, { status: 403 });
  }

  const { error } = await supabase.from("packages").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { message: "Paket berhasil dihapus" } });
}
