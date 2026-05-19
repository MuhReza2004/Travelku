import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("name")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json({
    data: {
      id: data.user.id,
      email: data.user.email,
      name: staff?.name ?? "",
    },
  });
}
