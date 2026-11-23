// src/app/api/admin/questions/[id]/reply/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

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
  const cors = getCorsHeaders(req);

  try {
    const { id } = await params;
    const questionId = Number(id);

    if (!questionId || isNaN(questionId)) {
      return Response.json(
        { ok: false, error: "Invalid question ID" },
        { status: 400, headers: cors }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.answer || typeof body.answer !== "string") {
      return Response.json(
        { ok: false, error: "Answer content is required" },
        { status: 400, headers: cors }
      );
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
        { status: 404, headers: cors }
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
        { status: 500, headers: cors }
      );
    }

    const user = (questionRecord as any).users;
    let telegramSent = false;
    let telegramError: string | null = null;
    let emailSent = false;
    let emailError: string | null = null;

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

    // 4. Optional: Deliver response via Email (Resend)
    if (send_email) {
      if (user?.email) {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
          emailError = "RESEND_API_KEY environment variable is not configured on the server";
          console.warn("[Reply API] Email skipped:", emailError);
        } else {
          try {
            const senderEmail = process.env.EMAIL_FROM || "TAMDAN Support <support@tamdan.online>";
            const subject = `Reply to your inquiry on TAMDAN`;
            const htmlContent = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <div style="border-bottom: 2px solid #00355a; padding-bottom: 12px; margin-bottom: 20px;">
                  <h2 style="color: #00355a; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">TAMDAN Support</h2>
                </div>
                <p style="color: #334155; font-size: 15px; line-height: 1.5; margin: 0 0 16px;">
                  Hello <strong>${escapeHtml(user.username || "there")}</strong>,
                </p>
                <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
                  Our team has reviewed and responded to your question:
                </p>
                <div style="background-color: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 4px; padding: 12px 16px; margin: 0 0 18px;">
                  <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Your Question</div>
                  <div style="font-size: 14px; color: #1e293b; line-height: 1.5;">${escapeHtml(questionRecord.question)}</div>
                </div>
                <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px; padding: 14px 16px; margin: 0 0 24px;">
                  <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #15803d; margin-bottom: 4px;">Response from TAMDAN</div>
                  <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-line;">${escapeHtml(answer.trim())}</div>
                </div>
                <div style="text-align: center; margin: 28px 0 20px;">
                  <a href="https://tamdan.online/faqs" style="display: inline-block; background-color: #00355a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 22px; border-radius: 6px;">
                    View on TAMDAN
                  </a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;" />
                <p style="font-size: 12px; color: #94a3b8; line-height: 1.4; margin: 0; text-align: center;">
                  © ${new Date().getFullYear()} TAMDAN • Automated News & Intelligence
                </p>
              </div>
            `;

            const resendRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: senderEmail,
                to: [user.email],
                subject,
                html: htmlContent,
              }),
            });

            if (resendRes.ok) {
              emailSent = true;
            } else {
              const resendErr = await resendRes.json().catch(() => ({}));
              emailError = resendErr.message || "Failed to send email via Resend";
              console.warn("[Reply API] Resend dispatch failed:", resendErr);
            }
          } catch (e: unknown) {
            emailError = e instanceof Error ? e.message : "Error dispatching email";
            console.warn("[Reply API] Email exception:", e);
          }
        }
      } else {
        emailError = "User does not have a registered email address";
      }
    }

    return Response.json(
      {
        ok: true,
        message: "Question answered successfully",
        question: updatedQuestion,
        delivery: {
          web: true,
          telegram_sent: telegramSent,
          telegram_error: telegramError,
          email_sent: emailSent,
          email_error: emailError,
        },
      },
      { headers: cors }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Reply API] Internal Error:", errorMsg);
    return Response.json({ ok: false, error: errorMsg }, { status: 500, headers: cors });
  }
}
