import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface SaveChatIdRequest {
  email: string;
  chat_id: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SaveChatIdRequest;

    const { email, chat_id } = body;

    if (!email || !chat_id) {
      return NextResponse.json(
        { error: "Missing email or chat_id" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("user")
      .update({ chat_id })
      .eq("email", email);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}
