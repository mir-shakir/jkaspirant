import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // During build without env vars, return a client that will return empty results
    return createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      serviceRoleKey || "placeholder",
      { auth: { persistSession: false } }
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
