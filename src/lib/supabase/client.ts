// src/lib/supabase/client.ts
// Browser-side Supabase client (safe: uses NEXT_PUBLIC_* vars)
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn(
        "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
    }
    // Create a dummy client to avoid hard crashes; calls will fail at runtime without keys
  }

  supabase = createClient(url as string, anonKey as string, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return supabase;
}

export default getSupabaseBrowserClient;
