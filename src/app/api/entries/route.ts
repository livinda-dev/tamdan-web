// src/app/api/entries/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withAuth, JwtClaims } from "@/lib/middleware";

export const runtime = "nodejs";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
}

async function handleGet(req: NextRequest, claims: JwtClaims): Promise<Response> {
  try {
    const email = claims.email ?? null;
    if (!email) {
      return Response.json(
        { ok: false, error: "Email not present in token; cannot resolve user id" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ ok: false, error: "Supabase env not configured" }, { status: 500 });
    }

    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("[Entries API] lookup user error:", userErr.message);
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!userRow?.id) {
      return Response.json(
        { ok: false, error: "User not found in database. Please sign out and sign in again." },
        { status: 404 }
      );
    }

    const { data: userTitle, error: titleError } = await supabase
      .from("topics")
      .select("topic")
      .eq("user_id", userRow.id)
      .maybeSingle();

    if (titleError) {
      console.error("[Entries API] get user_title error:", titleError.message);
      return Response.json({ ok: false, error: titleError.message }, { status: 502 });
    }

    return Response.json({ ok: true, title: userTitle?.topic ?? null });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

async function handlePost(req: NextRequest, claims: JwtClaims): Promise<Response> {
  try {
    const body = await req.json().catch(() => null as unknown);
    const content = Array.isArray(body?.content)
      ? body.content.join("\\n")
      : (body?.content ?? "").toString().trim();

    if (!content) {
      return Response.json({ ok: false, error: "Content is required" }, { status: 400 });
    }

    const email = claims.email ?? null;
    if (!email) {
      return Response.json(
        { ok: false, error: "Email not present in token; cannot resolve user id" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ ok: false, error: "Supabase env not configured" }, { status: 500 });
    }

    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("[Entries API] lookup user error:", userErr.message);
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!userRow?.id) {
      return Response.json(
        { ok: false, error: "User not found in database. Please sign out and sign in again." },
        { status: 404 }
      );
    }

    const insertPayload = { topic: content, user_id: userRow.id } as const;

    const { data: existingTitle, error: chckError } = await supabase
      .from("topics")
      .select("id,topic")
      .eq("user_id", userRow.id)
      .maybeSingle();

    if (chckError) {
      console.error("[Entries API] insert into topics error:", chckError.message);
      return Response.json({ ok: false, error: chckError.message }, { status: 502 });
    }

    let data;
    let error;
    if (existingTitle) {
      const updateResult = await supabase
        .from("topics")
        .update({ topic: content })
        .eq("user_id", userRow.id)
        .select();
      data = updateResult.data;
      error = updateResult.error;
    } else {
      const insertResult = await supabase.from("topics").insert(insertPayload).select();
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error("[Entries API] insert/update into user_title error:", error.message);
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }

    return Response.json({ ok: true, topics: data?.[0] ?? null });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
