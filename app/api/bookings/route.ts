import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { validateBooking } from "@/lib/validation";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status") || "";
  const packageName = searchParams.get("package_name") || "";
  const dateFrom = searchParams.get("date_from") || "";
  const dateTo = searchParams.get("date_to") || "";
  const search = searchParams.get("search") || "";
  const page = Math.max(0, parseInt(searchParams.get("page") || "0"));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("page_size") || String(PAGE_SIZE)))
  );

  let query = supabase
    .from("bookings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }
  if (packageName) {
    query = query.ilike("package_name", `%${packageName}%`);
  }
  if (dateFrom) {
    query = query.gte("departure_date", dateFrom);
  }
  if (dateTo) {
    query = query.lte("departure_date", dateTo);
  }
  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,contact.ilike.%${search}%`
    );
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    data: data ?? [],
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const errors = validateBooking(body);

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validasi gagal", errors }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_name: body.customer_name.trim(),
      contact: body.contact.trim(),
      package_name: body.package_name.trim(),
      departure_date: body.departure_date,
      participants: Number(body.participants),
      price_per_person: Number(body.price_per_person),
      notes: body.notes?.trim() ?? "",
      created_by: user.id,
      status: "Menunggu",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
