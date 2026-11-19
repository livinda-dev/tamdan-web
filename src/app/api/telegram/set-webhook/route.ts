// src/app/api/telegram/set-webhook/route.ts
import { NextRequest } from "next/server";
import { TELEGRAM_API_URL } from "@/lib/telegram";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "https://tamdan.online";
    const webhookUrl = `${origin}/api/telegram/webhook`;

    const res = await fetch(`${TELEGRAM_API_URL}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const json = await res.json();

    return Response.json({
      success: json.ok === true,
      registered_webhook: webhookUrl,
      telegram_response: json,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return Response.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
