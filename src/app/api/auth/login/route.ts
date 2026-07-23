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

    // Fetch user by email
    const { data: user, error: userErr } = await supabase
      .from("user")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!user) {
      return Response.json(
        { ok: false, error: "No account found with this email. Please check your email or sign up." },
        { status: 404 }
      );
    }

    // Verify password if password exists in database record
    if (user.password) {
      const isMatch = verifyPassword(password, user.password);
      if (!isMatch) {
        return Response.json(
          { ok: false, error: "Incorrect password. Please try again." },
          { status: 401 }
        );
      }
    } else {
      // If user row didn't have password saved yet, save it now
      try {
        const hashedPassword = hashPassword(password);
        await supabase
          .from("user")
          .update({ password: hashedPassword })
          .eq("email", email);
      } catch (e) {
        console.warn("Could not save password to existing user record:", e);
      }
    }

    const username = user.username || email.split("@")[0];
    const now = Math.floor(Date.now() / 1000);
    const token = createJwtToken({
      sub: user.id || email,
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
        id: user.id,
        username,
        email: user.email,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An error occurred during login.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
