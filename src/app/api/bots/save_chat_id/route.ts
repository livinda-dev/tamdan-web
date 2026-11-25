// src/app/api/bots/save_chat_id/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withAuth, JwtClaims } from "@/lib/middleware";

export const runtime = "nodejs";

async function handlePost(req: NextRequest, claims: JwtClaims) {
  try {
    if (!claims.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const { chat_id } = body || {};

    if (!chat_id) {
      return NextResponse.json({ error: "Missing chat_id" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("users")
      .update({ chat_id: String(chat_id) })
      .eq("email", claims.email)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: data[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ Save Chat ID Error:", msg);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export const POST = withAuth(handlePost);
