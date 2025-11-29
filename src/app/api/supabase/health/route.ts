// src/app/api/supabase/health/route.ts
import { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url) {
    return new Response(JSON.stringify({ ok: false, error: "Missing SUPABASE URL env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!key) {
    return new Response(JSON.stringify({ ok: false, error: "Missing SUPABASE key env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = getSupabaseServerClient();
    // Perform a very lightweight request: get current timestamp from Postgres via RPC if available,
    // otherwise call auth getSession which does not require a valid session.
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true, session: data.session ?? null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
      const message =
          e instanceof Error
              ? e.message
              : typeof e === "string"
                  ? e
                  : "Unknown error";

      return Response.json({ ok: false, error: message }, { status: 500 });
  }
}


