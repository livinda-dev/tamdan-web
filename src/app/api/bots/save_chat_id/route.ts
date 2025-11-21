import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, chat_id } = body;

    console.log("📩 API CALLED:", body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("user")
      .update({ chat_id })
      .eq("email", email)
      .select();

    console.log("🛠 Supabase Result:", data, error);

    if (error) return NextResponse.json({ error }, { status: 400 });
    if (!data || data.length === 0)
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
