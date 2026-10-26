// src/app/api/auth/magic-login/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmailFormat, createJwtToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !isValidEmailFormat(email)) {
      return Response.json(
        { ok: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { ok: false, error: "Database configuration missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch user by email from users table
    const { data: existingUser, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("[MagicLogin] Fetch user error:", userErr.message);
      return Response.json(
        { ok: false, error: `Database error: ${userErr.message}` },
        { status: 500 }
      );
    }

    let user = existingUser;

    // 2. If user doesn't exist in users table yet, create them automatically
    if (!user) {
      const derivedUsername =
        typeof body?.username === "string" && body.username.trim()
          ? body.username.trim()
          : email.split("@")[0];

      const { data: newUser, error: insertErr } = await supabase
        .from("users")
        .insert({
          email,
          username: derivedUsername,
          created_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (insertErr) {
        console.error("[MagicLogin] Insert user error:", insertErr.message);
        return Response.json(
          { ok: false, error: `Failed to create user: ${insertErr.message}` },
          { status: 500 }
        );
      }
      user = newUser;
    }

    const username = user?.username || email.split("@")[0];
    const userId = user?.id || email;
    const now = Math.floor(Date.now() / 1000);
    const token = createJwtToken({
      sub: userId,
      email,
      name: username,
      phone_number: user?.phone_number || "",
      iat: now,
      exp: now + 30 * 24 * 60 * 60,
    });

    const sessionObj = {
      token_type: "Bearer",
      access_token: token,
      id_token: token,
      expires_in: 2592000,
    };

    return Response.json({
      ok: true,
      session: sessionObj,
      user: {
        id: userId,
        username,
        email,
        phone_number: user?.phone_number || null,
        chat_id: user?.chat_id || null,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Magic login failed.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
