// src/app/api/entries/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function decodeJwtPayload<T = any>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return Response.json({ ok: false, error: "Missing Authorization Bearer token" }, { status: 401 });
    }
    const idToken = auth.slice("Bearer ".length).trim();
    const claims = decodeJwtPayload<{ sub: string; email?: string; name?: string }>(idToken);
    if (!claims?.sub) {
      return Response.json({ ok: false, error: "Invalid id_token" }, { status: 401 });
    }

    const body = await req.json().catch(() => null as any);
    const content = (body?.content ?? "").toString().trim();
    if (!content) {
      return Response.json({ ok: false, error: "Content is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ ok: false, error: "Supabase env not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    // We need the numeric user.id from public.user, using the email stored during Google sign-in
    const email = claims.email ?? null;
    if (!email) {
      return Response.json({ ok: false, error: "Email not present in id_token; cannot resolve user id" }, { status: 400 });
    }

    const { data: userRow, error: userErr } = await supabase
      .from("user")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("[Entries API] lookup user error:", userErr.message);
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!userRow?.id) {
      return Response.json({ ok: false, error: "User not found in database. Please sign out and sign in again." }, { status: 404 });
    }

    // Insert into public.user_title with FK to public.user(id)
    const insertPayload = {
      title: content,
      user_id: userRow.id,
    } as const;

    // Example schema:
    // create table if not exists public.user_title (
    //   id bigint generated always as identity primary key,
    //   title text not null,
    //   user_id bigint not null references public."user"(id) on delete cascade
    // );

    const { data, error } = await supabase.from("user_title").insert(insertPayload).select();
    if (error) {
      console.error("[Entries API] insert into user_title error:", error.message);
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }

    return Response.json({ ok: true, user_title: data?.[0] ?? null });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
