import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfilePage from "@/components/profile/ProfilePage";
import type { Metadata } from "next";

// The slug for the profile to display at the root path
const ROOT_PROFILE_SLUG = "william-lantelme-filho";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, title")
    .eq("slug", ROOT_PROFILE_SLUG)
    .single();

  if (!profile) {
    return {
      title: "Perfil não encontrado",
    };
  }

  return {
    title: `${profile.full_name} - Link in Bio`,
    description: profile.title || `Confira os links de ${profile.full_name}`,
  };
}

export default async function Home() {
  const supabase = await createClient();

  // Fetch profile for the root slug
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", ROOT_PROFILE_SLUG)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch social links
  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .eq("user_id", profile.id)
    .order("order", { ascending: true });

  // Fetch custom buttons
  const { data: customButtons } = await supabase
    .from("custom_buttons")
    .select("*")
    .eq("user_id", profile.id)
    .order("order", { ascending: true });

  return (
    <ProfilePage
      profile={profile}
      socialLinks={socialLinks || []}
      customButtons={customButtons || []}
    />
  );
}

