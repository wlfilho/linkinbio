import { createClient } from "@/lib/supabase/server";
import LeadsContent from "@/components/admin/LeadsContent";

export default async function LeadsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all leads
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <LeadsContent initialLeads={leads || []} userId={user.id} />;
}

