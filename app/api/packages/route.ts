import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(request.url);

  const page = Math.max(0, parseInt(searchParams.get("page") || "0"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") || String(PAGE_SIZE))));

  let query = supabase
    .from("packages")
    .select("*", { count: "exact" })
    .order("name", { ascending: true });

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Nama paket wajib diisi" }, { status: 400 });
  }
  if (!body.destination?.trim()) {
    return NextResponse.json({ error: "Destinasi wajib diisi" }, { status: 400 });
  }
  if (!body.duration?.trim()) {
    return NextResponse.json({ error: "Durasi wajib diisi" }, { status: 400 });
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
    .insert({
      name: body.name.trim(),
      destination: body.destination.trim(),
      duration: body.duration.trim(),
      description: body.description?.trim() ?? "",
      capacity,
      price,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
