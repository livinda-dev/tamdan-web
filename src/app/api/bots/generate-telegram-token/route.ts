// src/app/api/bots/generate-telegram-token/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withAuth, JwtClaims } from "@/lib/middleware";
import crypto from "crypto";

async function handlePost(req: NextRequest, _claims: JwtClaims): Promise<Response> {
  try {
    // phone_number comes from the request body or database
    const body = await req.json().catch(() => null);
    let phone_number: string | undefined =
      typeof body?.phone_number === "string" ? body.phone_number.trim() : undefined;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (!phone_number && _claims.email) {
      const { data: user } = await supabase
        .from("users")
        .select("phone_number")
        .eq("email", _claims.email)
        .maybeSingle();
      if (user?.phone_number) {
        phone_number = user.phone_number;
      }
    }

    if (!phone_number) {
      return Response.json(
        { error: "Please add a phone number in your profile before connecting Telegram." },
        { status: 400 }
      );
    }

    // Generate a unique one-time token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store the token in the telegram_tokens table
    const { error: insertError } = await supabase.from("telegram_tokens").insert({
      token,
      phone_number,
      expires_at: expiresAt.toISOString(),
      used: false,
    });

    if (insertError) {
      console.error("Failed to store token:", insertError);
      return Response.json({ error: "Failed to generate token" }, { status: 500 });
    }

    return Response.json({ ok: true, token });
  } catch (err) {
    console.error("Token generation error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withAuth(handlePost);