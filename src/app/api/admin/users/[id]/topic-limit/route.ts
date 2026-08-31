// src/app/api/admin/users/[id]/topic-limit/route.ts
// Admin-only endpoint to set the topic_limit for a specific user.
// Requires a valid Bearer token that belongs to a user with is_admin = true.

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withAuth, JwtClaims } from "@/lib/middleware";

export const runtime = "nodejs";

function getSupabase() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
}

async function handlePatch(
  req: NextRequest,
  claims: JwtClaims,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    if (!claims.email) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json(
        { ok: false, error: "Supabase env not configured" },
        { status: 500 }
      );
    }

    // Verify requesting user is admin
    const { data: adminUser, error: adminErr } = await supabase
      .from("users")
      .select("is_admin")
      .eq("email", claims.email)
      .maybeSingle();

    if (adminErr) {
      return Response.json({ ok: false, error: adminErr.message }, { status: 502 });
    }

    if (!adminUser?.is_admin) {
      return Response.json(
        { ok: false, error: "Forbidden: admin access required" },
        { status: 403 }
      );
    }

    // Parse body
    const body = await req.json().catch(() => null);
    const topicLimit = body?.topic_limit;

    if (topicLimit === undefined || typeof topicLimit !== "number" || topicLimit < 1) {
      return Response.json(
        { ok: false, error: "topic_limit must be a positive integer" },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Update target user's topic_limit
    const { data, error } = await supabase
      .from("users")
      .update({ topic_limit: Math.floor(topicLimit) })
      .eq("id", id)
      .select("id, email, username, topic_limit")
      .maybeSingle();

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }

    if (!data) {
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true, user: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

// Next.js 15 dynamic route handlers receive params as a second context argument
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth((r: NextRequest, claims: JwtClaims) =>
    handlePatch(r, claims, context)
  )(req);
}
