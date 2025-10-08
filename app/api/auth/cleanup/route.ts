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
      .select("id");

    if (profilesError) {
      console.error("Error listing profiles:", profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const profileIds = new Set(profiles?.map((p) => p.id) || []);
    const orphanUsers = users.users.filter((user) => !profileIds.has(user.id));

    console.log(`Found ${orphanUsers.length} orphan users`);

    // Delete orphan users
    const deletedUsers = [];
    for (const user of orphanUsers) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Error deleting user ${user.email}:`, deleteError);
      } else {
        deletedUsers.push({ id: user.id, email: user.email });
        console.log(`Deleted orphan user: ${user.email}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedUsers.length} orphan users`,
      deletedUsers,
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
      .select("id, full_name, email:slug");

    if (profilesError) {
      console.error("Error listing profiles:", profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const profileIds = new Set(profiles?.map((p) => p.id) || []);
    const orphanUsers = users.users.filter((user) => !profileIds.has(user.id));

    return NextResponse.json({
      totalUsers: users.users.length,
      totalProfiles: profiles?.length || 0,
      orphanUsers: orphanUsers.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
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

