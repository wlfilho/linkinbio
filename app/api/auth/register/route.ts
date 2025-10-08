import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("\n=== REGISTRATION START ===");

  try {
    const body = await request.json();
    const { email, password, fullName, title } = body;
    console.log("1. Request received for email:", email);

    // Validate input
    if (!email || !password || !fullName) {
      console.log("❌ Validation failed: missing required fields");
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    console.log("2. Checking if user exists...");
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (userExists) {
      console.log("⚠️  User found in auth.users:", userExists.id);

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userExists.id)
        .maybeSingle();

      console.log("   Profile check result:", existingProfile ? "EXISTS" : "NOT FOUND");

      if (existingProfile) {
        console.log("❌ User already has profile - registration blocked");
        return NextResponse.json(
          { error: "Usuário já existe. Faça login." },
          { status: 400 }
        );
      } else {
        // User exists but no profile - delete user completely
        console.log("🧹 Deleting orphan user:", userExists.email);
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userExists.id);
        if (deleteError) {
          console.error("❌ Failed to delete orphan user:", deleteError);
        } else {
          console.log("✅ Orphan user deleted successfully");
        }
        // Wait a bit to ensure deletion is complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      console.log("✅ No existing user found");
    }

    // Generate slug from full name
    const slug = fullName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    console.log("3. Generated slug:", slug);

    // Check if slug already exists
    const { data: existingSlug } = await supabaseAdmin
      .from("profiles")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    let finalSlug = slug;
    if (existingSlug) {
      finalSlug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
      console.log("⚠️  Slug exists, using unique slug:", finalSlug);
    } else {
      console.log("✅ Slug is unique");
    }

    // Create user with admin client
    console.log("4. Creating user in auth.users...");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        slug: finalSlug,
      },
    });

    if (authError) {
      console.error("❌ Auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      console.error("❌ No user data returned");
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    console.log("✅ User created in auth.users:", authData.user.id);

    // Wait a moment to ensure user is fully created
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check if profile was auto-created by trigger
    console.log("5. Checking if profile was auto-created by trigger...");
    const { data: autoProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (autoProfile) {
      console.log("✅ Profile was auto-created by trigger");
      return NextResponse.json({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      });
    }

    // Create profile manually if trigger didn't work
    console.log("6. Creating profile manually...");
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      full_name: fullName,
      title: title || null,
      slug: finalSlug,
    });

    if (profileError) {
      console.error("❌ Profile error:", profileError);
      console.log("🧹 Rolling back - deleting user...");
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({
        error: `Erro ao criar perfil: ${profileError.message}`,
        details: profileError
      }, { status: 500 });
    }

    console.log("✅ Profile created successfully");
    console.log(`=== REGISTRATION COMPLETE (${Date.now() - startTime}ms) ===\n`);

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    console.log(`=== REGISTRATION FAILED (${Date.now() - startTime}ms) ===\n`);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

