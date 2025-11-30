import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decodeJwtPayload } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const claims = decodeJwtPayload<{ email?: string }>(idToken);

    if (!claims?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const email = claims.email;

    // Generate a unique one-time token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Store the token in a new table
    const { error: insertError } = await supabase
      .from("telegram_tokens")
      .insert({
        token,
        email,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (insertError) {
      console.error("Failed to store token:", insertError);
      return NextResponse.json(
        { error: "Failed to generate token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, token });
  } catch (err) {
    console.error("Token generation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}