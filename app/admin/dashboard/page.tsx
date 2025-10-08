import { createClient } from "@/lib/supabase/server";
import DashboardContent from "@/components/admin/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch social links
  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .eq("user_id", user.id)
    .order("order", { ascending: true });

  // Fetch custom buttons
  const { data: customButtons } = await supabase
    .from("custom_buttons")
    .select("*")
    .eq("user_id", user.id)
    .order("order", { ascending: true });

  return (
    <DashboardContent
      profile={profile}
      initialSocialLinks={socialLinks || []}
      initialCustomButtons={customButtons || []}
    />
  );
}

