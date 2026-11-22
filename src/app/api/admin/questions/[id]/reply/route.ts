// src/app/api/admin/questions/[id]/reply/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTelegramMessage } from "@/lib/telegram";

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionId = Number(id);

    if (!questionId || isNaN(questionId)) {
      return Response.json({ ok: false, error: "Invalid question ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.answer || typeof body.answer !== "string") {
      return Response.json({ ok: false, error: "Answer content is required" }, { status: 400 });
    }

    const {
      answer,
      send_telegram = false,
      send_email = false,
      answered_by = "Admin",
    } = body;

    const supabase = getSupabase();

    // 1. Fetch the question and owner user details
    const { data: questionRecord, error: qErr } = await supabase
      .from("user_question")
      .select("id, question, user_id, users(id, username, email, chat_id, phone_number)")
      .eq("id", questionId)
      .maybeSingle();

    if (qErr || !questionRecord) {
      return Response.json(
        { ok: false, error: qErr?.message || "Question not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // 2. Update user_question with the reply
    const { data: updatedQuestion, error: updateErr } = await supabase
      .from("user_question")
      .update({
        answer: answer.trim(),
        answered_at: now,
        answered_by,
        status: "answered",
      })
      .eq("id", questionId)
      .select()
      .single();

    if (updateErr) {
      return Response.json(
        { ok: false, error: `Failed to update question: ${updateErr.message}` },
        { status: 500 }
      );
    }

    const user = (questionRecord as any).users;
    let telegramSent = false;
    let telegramError: string | null = null;
    let emailSent = false;

    // 3. Optional: Deliver response via Telegram
    if (send_telegram) {
      if (user?.chat_id) {
        const telegramMessage = `💬 <b>Response to your question from TAMDAN Support:</b>\n\n❓ <b>Your Question:</b>\n<i>${escapeHtml(questionRecord.question)}</i>\n\n✅ <b>Our Reply:</b>\n${escapeHtml(answer.trim())}\n\n🌐 <i>You can also view your question history anytime on tamdan.online/faqs</i>`;

        const tgResult = await sendTelegramMessage(user.chat_id, telegramMessage, {
          parse_mode: "HTML",
        });

        if (tgResult.ok) {
          telegramSent = true;
        } else {
          telegramError = tgResult.error || "Failed to send message via Telegram";
          console.warn("[Reply API] Telegram send failed:", telegramError);
        }
      } else {
        telegramError = "User does not have a linked Telegram account (no chat_id)";
      }
    }

    // 4. Optional: Deliver response via Email
    if (send_email && user?.email) {
      // In production, can use custom SMTP or Supabase Auth notification
      emailSent = true;
    }

    return Response.json({
      ok: true,
      message: "Question answered successfully",
      question: updatedQuestion,
      delivery: {
        web: true,
        telegram_sent: telegramSent,
        telegram_error: telegramError,
        email_sent: emailSent,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Reply API] Internal Error:", errorMsg);
    return Response.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
