// src/lib/supabase/server.ts
// Server-side Supabase helper. Uses service role key if provided, otherwise falls back to anon.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null = null;

export function getSupabaseServerClient() {
  if (serverClient) return serverClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL; // support both
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // never expose to client

  if (!url || !(serviceKey || anonKey)) {
    // eslint-disable-next-line no-console
    console.warn(
      "Supabase env vars are missing. Provide SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY"
    );
  }

  serverClient = createClient(url as string, (serviceKey || anonKey) as string, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}

export default getSupabaseServerClient;
