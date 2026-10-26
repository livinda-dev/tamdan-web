// src/app/api/auth/reset-password/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmailFormat, hashPassword, createJwtToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !isValidEmailFormat(email)) {
      return Response.json(
        { ok: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return Response.json(
        { ok: false, error: "Password must be at least 6 characters long." },
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

    const hashedPassword = hashPassword(password);

    // 1. Update password in the custom users table
    const { data: updatedUser, error: updateErr } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error("[ResetPassword] Update users table error:", updateErr.message);
      return Response.json(
        { ok: false, error: `Failed to update password: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // 2. Also try updating in Supabase Auth if service role key is configured
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers?.users?.find(
          (u) => u.email?.toLowerCase() === email
        );
        if (authUser) {
          await supabase.auth.admin.updateUserById(authUser.id, {
            password,
          });
        }
      } catch (authErr) {
        console.warn("[ResetPassword] Supabase auth sync warning:", authErr);
      }
    }

    // 3. Generate Tamdan session token so user is automatically signed in
    const username = updatedUser?.username || email.split("@")[0];
    const userId = updatedUser?.id || email;
    const now = Math.floor(Date.now() / 1000);
    const token = createJwtToken({
      sub: userId,
      email,
      name: username,
      phone_number: updatedUser?.phone_number || "",
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
      message: "Password has been successfully updated.",
      session: sessionObj,
      user: {
        id: userId,
        username,
        email,
        phone_number: updatedUser?.phone_number || null,
        chat_id: updatedUser?.chat_id || null,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reset password.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
