import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone_number, chat_id } = body;

    console.log("📩 API CALLED:", body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("users")
      .update({ chat_id })
      .eq("phone_number", phone_number)
      .select();

    console.log("🛠 Supabase Result:", data, error);

    if (error) return NextResponse.json({ error }, { status: 400 });
    if (!data || data.length === 0)
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
