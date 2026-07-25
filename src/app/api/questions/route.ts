// src/app/api/questions/route.ts
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

async function handleGet(_req: NextRequest, claims: JwtClaims): Promise<Response> {
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
      console.error("[Questions API] lookup user error:", userErr.message);
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!userRow?.id) {
      return Response.json(
        { ok: false, error: "User not found in database. Please sign out and sign in again." },
        { status: 404 }
      );
    }

    const { data: userQuestion, error: questionError } = await supabase
      .from("user_question")
      .select("question")
      .eq("user_id", userRow.id);

    if (questionError) {
      console.error("[Questions API] get user_question error:", questionError.message);
      return Response.json({ ok: false, error: questionError.message }, { status: 502 });
    }

    return Response.json({ ok: true, questions: userQuestion });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

async function handlePost(req: NextRequest, claims: JwtClaims): Promise<Response> {
  try {
    const body = await req.json().catch(() => null as unknown);
    const content = (body?.content ?? "").toString().trim();
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
      console.error("[Questions API] lookup user error:", userErr.message);
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!userRow?.id) {
      return Response.json(
        { ok: false, error: "User not found in database. Please sign out and sign in again." },
        { status: 404 }
      );
    }

    const insertPayload = { question: content, user_id: userRow.id } as const;

    const { data, error } = await supabase
      .from("user_question")
      .insert(insertPayload)
      .select();

    if (error) {
      console.error("[Questions API] insert into user_question error:", error.message);
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }

    return Response.json({ ok: true, user_question: data?.[0] ?? null });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
