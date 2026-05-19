import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { validateBooking } from "@/lib/validation";
import { checkPackageCapacity, createAuditLog, getStaffRole } from "@/lib/helpers/audit";
import { resolvePackage } from "@/lib/helpers/package";

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getStaffRole(supabase, user.id);

  const { data: existing } = await supabase
    .from("bookings")
    .select("created_by, customer_name, participants, price_per_person")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Pemesanan tidak ditemukan" }, { status: 404 });
  }

  if (role !== "admin" && existing.created_by !== user.id) {
    return NextResponse.json({ error: "Anda tidak memiliki akses" }, { status: 403 });
  }

  const body = await request.json();
  const errors = validateBooking(body);

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validasi gagal", errors }, { status: 400 });
  }

  const resolved = await resolvePackage(
    supabase,
    body.package_id,
    body.package_name,
    Number(body.price_per_person)
  );

  if (resolved.package_id) {
    const capacityError = await checkPackageCapacity(
      supabase,
      resolved.package_id,
      body.departure_date,
      Number(body.participants),
      id
    );
    if (capacityError) {
      return NextResponse.json(
        { error: capacityError, errors: [{ field: "participants", message: capacityError }] },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({
      customer_name: body.customer_name.trim(),
      contact: body.contact.trim(),
      package_id: resolved.package_id,
      package_name: resolved.package_name,
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

  await createAuditLog(supabase, id, user.id, "updated", {
    before: {
      customer_name: existing.customer_name,
      participants: existing.participants,
      price_per_person: existing.price_per_person,
    },
  });

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

  const { data: existing } = await supabase
    .from("bookings")
    .select("created_by")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Pemesanan tidak ditemukan" }, { status: 404 });
  }

  if (role !== "admin" && existing.created_by !== user.id) {
    return NextResponse.json({ error: "Anda tidak memiliki akses" }, { status: 403 });
  }

  await createAuditLog(supabase, id, user.id, "deleted");

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { message: "Pemesanan berhasil dihapus" } });
}
