import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Stellt sicher, dass für den eingeloggten Nutzer eine profiles-Zeile
 * existiert, bevor onboarding_completed_at o. Ä. gelesen wird. Der
 * Erstellungs-Trigger auf auth.users deckt normale Registrierungen ab,
 * aber Konten, die vor dem Trigger angelegt wurden (oder falls er aus
 * irgendeinem Grund nicht feuert), hätten sonst überhaupt keine Zeile –
 * jede Prüfung würde lautlos ins Leere laufen, u. a. mit einer
 * Onboarding-Endlosschleife als Folge.
 */
export async function ensureProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  email: string | null,
): Promise<void> {
  const { data } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (data) return;

  await supabase.from("profiles").upsert({ id: userId, email }, { onConflict: "id" });
}
