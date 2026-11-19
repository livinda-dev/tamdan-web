// src/app/api/telegram/send-message/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  convertHtmlToTelegram,
  splitIntoChunks,
  sendTelegramMessage,
} from "@/lib/telegram";

export const runtime = "nodejs";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return Response.json({ ok: false, error: "Missing JSON request body" }, { status: 400 });
    }

    const { phone_number, chat_id: explicitChatId, message } = body;

    if (!message || typeof message !== "string") {
      return Response.json({ ok: false, error: "Message content is required" }, { status: 400 });
    }

    let targetChatId = explicitChatId ? String(explicitChatId) : null;

    // If chat_id not directly provided, resolve via phone_number in users table
    if (!targetChatId && phone_number) {
      const supabase = getSupabase();
      const { data: user, error: userErr } = await supabase
        .from("users")
        .select("chat_id")
        .eq("phone_number", String(phone_number).trim())
        .maybeSingle();

      if (userErr) {
        return Response.json({ ok: false, error: `Database error: ${userErr.message}` }, { status: 500 });
      }

      if (!user) {
        return Response.json({ ok: false, error: "Phone number not registered" }, { status: 404 });
      }

      targetChatId = user.chat_id || null;
    }

    if (!targetChatId) {
      return Response.json(
        { ok: false, error: "User has not connected Telegram (no chat_id found)" },
        { status: 400 }
      );
    }

    // Convert HTML to Telegram HTML format
    const telegramText = convertHtmlToTelegram(message);
    const chunks = splitIntoChunks(telegramText);

    const sendResults = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const result = await sendTelegramMessage(targetChatId, chunk, { parse_mode: "HTML" });

      sendResults.push({ chunk: i + 1, ...result });

      if (!result.ok) {
        console.error(`[Telegram SendMessage] Chunk ${i + 1} failed:`, result.error);
        return Response.json(
          {
            ok: false,
            error: "Failed to send chunk to Telegram",
            chunk: i + 1,
            details: result.error,
          },
          { status: 502 }
        );
      }
    }

    return Response.json({
      ok: true,
      status: "sent",
      chat_id: targetChatId,
      chunks_sent: chunks.length,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Telegram SendMessage] Fatal error:", errorMsg);
    return Response.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
