import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { id } = await params;

  const { data: logs, error } = await supabase
    .from("booking_audit_logs")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const staffIds = [...new Set((logs ?? []).map((l) => l.staff_id))];

  const staffMap = new Map<string, string>();
  if (staffIds.length > 0) {
    const { data: staffList } = await supabase
      .from("staff")
      .select("id, name")
      .in("id", staffIds);
    for (const s of staffList ?? []) {
      staffMap.set(s.id, s.name);
    }
  }

  const data = (logs ?? []).map((log) => ({
    ...log,
    staff_name: staffMap.get(log.staff_id) ?? "Unknown",
  }));

  return NextResponse.json({ data });
}
