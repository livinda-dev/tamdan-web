import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmailFormat } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !isValidEmailFormat(email)) {
      return Response.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return Response.json({ ok: false, error: "Database configuration missing" }, { status: 500 });
    }

    const siteUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error("[ResendVerification] Error:", error.message);
      return Response.json({ ok: false, error: error.message }, { status: 400 });
    }

    return Response.json({
      ok: true,
      message: "A new confirmation email has been dispatched. Please check your inbox and spam folder.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to resend confirmation email.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
