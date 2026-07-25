// src/app/api/profile/route.ts
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

async function handleGet(_req: NextRequest, claims: JwtClaims): Promise<Response> {
  try {
    if (!claims.email) {
      return Response.json({ ok: false, error: "Email not present in token" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ ok: false, error: "Supabase env missing" }, { status: 500 });
    }

    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("email", claims.email)
      .maybeSingle();

    if (userErr) {
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!user) {
      return Response.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    return Response.json({ ok: true, user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}

async function handlePatch(req: NextRequest, claims: JwtClaims): Promise<Response> {
  try {
    if (!claims.email) {
      return Response.json({ ok: false, error: "Email not present in token" }, { status: 400 });
    }

    const body = await req.json();
    const username =
      typeof body?.username === "string" ? body.username.trim() : undefined;
    const secondaryEmail =
      typeof body?.secondary_email === "string"
        ? body.secondary_email.trim()
        : undefined;
    const chatId = body?.chat_id;

    if (username === undefined && secondaryEmail === undefined && chatId === undefined) {
      return Response.json({ ok: false, error: "Missing fields to update" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ ok: false, error: "Supabase env missing" }, { status: 500 });
    }

    // If updating secondary_email, ensure it's not already used by another user
    if (secondaryEmail !== undefined) {
      const { data: existingEmail, error: e1 } = await supabase
        .from("users")
        .select("email, secondary_email")
        .eq("email", secondaryEmail)
        .limit(1);

      if (e1) {
        return Response.json({ ok: false, error: e1.message }, { status: 502 });
      }

      if (existingEmail && existingEmail.length > 0) {
        if (existingEmail[0].email !== claims.email) {
          return Response.json({ ok: false, error: "Email already in use" }, { status: 409 });
        }
      }

      const { data: existingSecondary, error: e2 } = await supabase
        .from("users")
        .select("email, secondary_email")
        .eq("secondary_email", secondaryEmail)
        .limit(1);

      if (e2) {
        return Response.json({ ok: false, error: e2.message }, { status: 502 });
      }

      if (existingSecondary && existingSecondary.length > 0) {
        if (existingSecondary[0].email !== claims.email) {
          return Response.json({ ok: false, error: "Email already in use" }, { status: 409 });
        }
      }
    }

    const updates: Record<string, unknown> = {};
    if (username !== undefined) updates.username = username;
    if (secondaryEmail !== undefined) updates.secondary_email = secondaryEmail;
    if (chatId !== undefined) updates.chat_id = chatId;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("email", claims.email)
      .select()
      .maybeSingle();

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }

    return Response.json({ ok: true, user: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const PATCH = withAuth(handlePatch);
