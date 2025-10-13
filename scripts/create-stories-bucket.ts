/**
 * Script to create the 'stories' storage bucket in Supabase
 * Run this script once to set up the storage bucket for stories
 *
 * Usage: npx tsx scripts/create-stories-bucket.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables!");
  console.error("Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createStoriesBucket() {
  console.log("🚀 Creating 'stories' storage bucket...");

  try {
    // Check if bucket already exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      throw listError;
    }

    const bucketExists = existingBuckets?.some((bucket) => bucket.id === "stories");

    if (bucketExists) {
      console.log("✅ Bucket 'stories' already exists!");
      return;
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket("stories", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ],
    });

    if (error) {
      throw error;
    }

    console.log("✅ Bucket 'stories' created successfully!");
    console.log("📋 Bucket configuration:");
    console.log("   - Public: true");
    console.log("   - Max file size: 50MB");
    console.log("   - Allowed types: images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV)");

    // Set up RLS policies
    console.log("\n🔒 Setting up RLS policies...");

    // Policy 1: Public read access
    const { error: policy1Error } = await supabase.rpc("create_storage_policy", {
      bucket_name: "stories",
      policy_name: "Public read access",
      definition: "true",
      operation: "SELECT",
    });

    if (policy1Error && !policy1Error.message.includes("already exists")) {
      console.warn("⚠️  Warning: Could not create public read policy:", policy1Error.message);
    } else {
      console.log("✅ Public read access policy created");
    }

    // Policy 2: Authenticated users can upload
    const { error: policy2Error } = await supabase.rpc("create_storage_policy", {
      bucket_name: "stories",
      policy_name: "Authenticated users can upload",
      definition: "auth.role() = 'authenticated'",
      operation: "INSERT",
    });

    if (policy2Error && !policy2Error.message.includes("already exists")) {
      console.warn("⚠️  Warning: Could not create upload policy:", policy2Error.message);
    } else {
      console.log("✅ Authenticated upload policy created");
    }

    // Policy 3: Users can update their own files
    const { error: policy3Error } = await supabase.rpc("create_storage_policy", {
      bucket_name: "stories",
      policy_name: "Users can update their own files",
      definition: "auth.uid()::text = (storage.foldername(name))[1]",
      operation: "UPDATE",
    });

    if (policy3Error && !policy3Error.message.includes("already exists")) {
      console.warn("⚠️  Warning: Could not create update policy:", policy3Error.message);
    } else {
      console.log("✅ User update policy created");
    }

    // Policy 4: Users can delete their own files
    const { error: policy4Error } = await supabase.rpc("create_storage_policy", {
      bucket_name: "stories",
      policy_name: "Users can delete their own files",
      definition: "auth.uid()::text = (storage.foldername(name))[1]",
      operation: "DELETE",
    });

    if (policy4Error && !policy4Error.message.includes("already exists")) {
      console.warn("⚠️  Warning: Could not create delete policy:", policy4Error.message);
    } else {
      console.log("✅ User delete policy created");
    }

    console.log("\n🎉 Setup complete! You can now upload stories to Supabase Storage.");
  } catch (error: any) {
    console.error("❌ Error creating bucket:", error.message);
    process.exit(1);
  }
}

createStoriesBucket();

