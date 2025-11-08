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
  try {
    const body = await request.json();
    const { user_id, full_name, email, whatsapp, selected_material_id } = body;

    // Validate required fields
    if (!user_id || !full_name || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Campos obrigatórios: user_id, full_name, email, whatsapp" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Validate phone (should have 10 or 11 digits)
    const phoneNumbers = whatsapp.replace(/\D/g, "");
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      return NextResponse.json(
        { error: "Telefone deve ter 10 ou 11 dígitos" },
        { status: 400 }
      );
    }

    // Verify that the user_id exists in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado" },
        { status: 404 }
      );
    }

    // If selected_material_id is provided, verify it exists and belongs to the user
    if (selected_material_id) {
      const { data: material, error: materialError } = await supabaseAdmin
        .from("free_materials")
        .select("id")
        .eq("id", selected_material_id)
        .eq("user_id", user_id)
        .single();

      if (materialError || !material) {
        return NextResponse.json(
          { error: "Material selecionado não encontrado ou não pertence ao usuário" },
          { status: 404 }
        );
      }
    }

    // Insert lead using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({
        user_id,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        whatsapp,
        selected_material_id: selected_material_id || null,
      })
      .select();

    if (error) {
      console.error("Error inserting lead:", error);
      return NextResponse.json(
        { error: `Erro ao inserir lead: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error("No data returned from insert");
      return NextResponse.json(
        { error: "Erro ao criar lead: nenhum dado retornado" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0], // Return the first (and only) inserted record
    });
  } catch (error: any) {
    console.error("Unexpected error in leads API:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

