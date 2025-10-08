import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfilePage from "@/components/profile/ProfilePage";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, title")
    .eq("slug", slug)
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

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
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

