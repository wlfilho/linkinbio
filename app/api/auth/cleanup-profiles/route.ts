import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST() {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error("Error listing users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, slug");

    if (profilesError) {
      console.error("Error listing profiles:", profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const userIds = new Set(users.users.map((u) => u.id));
    const orphanProfiles = profiles?.filter((profile) => !userIds.has(profile.id)) || [];

    console.log(`Found ${orphanProfiles.length} orphan profiles`);

    // Delete orphan profiles
    const deletedProfiles = [];
    for (const profile of orphanProfiles) {
      const { error: deleteError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", profile.id);

      if (deleteError) {
        console.error(`Error deleting profile ${profile.id}:`, deleteError);
      } else {
        deletedProfiles.push(profile);
        console.log(`Deleted orphan profile: ${profile.full_name} (${profile.id})`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedProfiles.length} orphan profiles`,
      deletedProfiles,
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error("Error listing users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, slug");

    if (profilesError) {
      console.error("Error listing profiles:", profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const userIds = new Set(users.users.map((u) => u.id));
    const orphanProfiles = profiles?.filter((profile) => !userIds.has(profile.id)) || [];

    return NextResponse.json({
      totalUsers: users.users.length,
      totalProfiles: profiles?.length || 0,
      orphanProfiles: orphanProfiles.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        slug: p.slug,
      })),
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

