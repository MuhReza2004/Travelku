import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, password, dan nama wajib diisi" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabase();

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json(
      { error: "Gagal membuat akun" },
      { status: 500 }
    );
  }

  const { error: profileError } = await supabase.from("staff").insert({
    id: authData.user.id,
    name,
    email,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      id: authData.user.id,
      email: authData.user.email,
      name,
    },
  });
}
