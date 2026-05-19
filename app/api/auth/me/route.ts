import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("name")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    data: {
      id: user.id,
      email: user.email,
      name: staff?.name ?? "",
    },
  });
}
