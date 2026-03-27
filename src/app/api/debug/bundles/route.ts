import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const diagnostics: Record<string, unknown> = {};

  // 1. Check env vars
  diagnostics.env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `SET (starts with ${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...)`
      : "MISSING",
  };

  // 2. Try creating the client
  try {
    const supabase = createServerClient();
    diagnostics.client = "created successfully";

    // 3. Try raw query without any filters
    const rawResult = await supabase.from("bundles").select("*");
    diagnostics.rawQuery = {
      data: rawResult.data,
      error: rawResult.error,
      count: rawResult.data?.length ?? 0,
    };

    // 4. Try with is_active filter
    const filteredResult = await supabase
      .from("bundles")
      .select("*")
      .eq("is_active", true);
    diagnostics.filteredQuery = {
      data: filteredResult.data,
      error: filteredResult.error,
      count: filteredResult.data?.length ?? 0,
    };

    // 5. Try the exact query used by getAllBundles
    const fullResult = await supabase
      .from("bundles")
      .select("*, exam:exams(slug, title), files:bundle_files(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    diagnostics.fullQuery = {
      data: fullResult.data,
      error: fullResult.error,
      count: fullResult.data?.length ?? 0,
    };
  } catch (err) {
    diagnostics.clientError = String(err);
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
