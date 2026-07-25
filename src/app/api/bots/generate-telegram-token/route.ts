// src/app/api/bots/generate-telegram-token/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withAuth, JwtClaims } from "@/lib/middleware";
import crypto from "crypto";

async function handlePost(req: NextRequest, _claims: JwtClaims): Promise<Response> {
  try {
    // phone_number comes from the request body (it is not embedded in the JWT)
    const body = await req.json().catch(() => null);
    const phone_number: string | undefined =
      typeof body?.phone_number === "string" ? body.phone_number.trim() : undefined;

    if (!phone_number) {
      return Response.json({ error: "phone_number is required" }, { status: 400 });
    }

    // Generate a unique one-time token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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