import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmailFormat, hashPassword, verifyPassword, createJwtToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !isValidEmailFormat(email)) {
      return Response.json(
        { ok: false, error: "Please enter a valid email address format (e.g. user@example.com)." },
        { status: 400 }
      );
    }

    if (!password) {
      return Response.json(
        { ok: false, error: "Password is required." },
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

    // 1. Fetch user by email from users table
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("[Login] Fetch user error:", userErr.message);
      return Response.json({ ok: false, error: `Database error: ${userErr.message}` }, { status: 500 });
    }

    if (!user) {
      return Response.json(
        { ok: false, error: "No account found with this email. Please check your email or sign up." },
        { status: 404 }
      );
    }

    // 2. Verify password against hashed password in database
    if (user.password) {
      const isMatch = verifyPassword(password, user.password);
      if (!isMatch) {
        return Response.json(
          { ok: false, error: "Incorrect password. Please try again." },
          { status: 401 }
        );
      }
    } else {
      // If user row existed (e.g. created previously without password), set the password now
      const hashedPassword = hashPassword(password);
      await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("email", email);
    }

    const username = user.username || email.split("@")[0];
    const userId = user.id || email;
    const now = Math.floor(Date.now() / 1000);
    const token = createJwtToken({
      sub: userId,
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
        id: userId,
        username,
        email,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An error occurred during login.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
