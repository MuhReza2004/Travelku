import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolvePackage(
  supabase: SupabaseClient,
  packageId: string | undefined | null,
  packageName: string,
  pricePerPerson: number
): Promise<{ package_id: string | null; package_name: string }> {
  const name = packageName.trim();
  if (!name) return { package_id: null, package_name: "" };

  if (packageId) {
    return { package_id: packageId, package_name: name };
  }

  const { data: existing } = await supabase
    .from("packages")
    .select("id, name")
    .ilike("name", name)
    .maybeSingle();

  if (existing) {
    return { package_id: existing.id, package_name: existing.name };
  }

  const { data: created, error } = await supabase
    .from("packages")
    .insert({
      name,
      destination: "Lainnya",
      duration: "-",
      capacity: 999,
      price: pricePerPerson,
      description: "Otomatis dibuat dari pemesanan",
    })
    .select("id, name")
    .single();

  if (error || !created) {
    return { package_id: null, package_name: name };
  }

  return { package_id: created.id, package_name: created.name };
}
