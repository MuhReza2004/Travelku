import { NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi" },
      { status: 400 }
    );
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createServiceRoleSupabase();
    const { data: allUsers } = await admin.auth.admin.listUsers();
    const userExists = allUsers?.users?.some((u) => u.email === email);

    if (!userExists) {
      return NextResponse.json(
        { error: "Email tidak terdaftar" },
        { status: 404 }
      );
    }
  }

  const supabase = await createServerSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
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
