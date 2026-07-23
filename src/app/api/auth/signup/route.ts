import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmailFormat, hashPassword, createJwtToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username) {
      return Response.json({ ok: false, error: "Username is required." }, { status: 400 });
    }

    if (!email || !isValidEmailFormat(email)) {
      return Response.json(
        { ok: false, error: "Please enter a valid email address format (e.g. user@example.com)." },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return Response.json(
        { ok: false, error: "Password must be at least 4 characters long." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ ok: false, error: "Database configuration missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("user")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return Response.json(
        { ok: false, error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);
    const created_at = new Date().toISOString();

    let createdUser: { id?: number | string; username?: string; email?: string } | null = null;

    // Try inserting user with password
    const { data: insertedData, error: insertError } = await supabase
      .from("user")
      .insert({
        username,
        email,
        password: hashedPassword,
        created_at,
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.warn("Insert with password failed, trying without password field:", insertError.message);
      // Fallback insert without password field if column is missing
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("user")
        .insert({
          username,
          email,
          created_at,
        })
        .select()
        .maybeSingle();

      if (fallbackError) {
        return Response.json({ ok: false, error: fallbackError.message }, { status: 502 });
      }
      createdUser = fallbackData;
    } else {
      createdUser = insertedData;
    }

    const now = Math.floor(Date.now() / 1000);
    const token = createJwtToken({
      sub: createdUser?.id || email,
      email,
      name: username,
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
        username,
        email,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An error occurred during signup.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
