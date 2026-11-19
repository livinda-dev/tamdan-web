// src/app/api/entries/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withAuth, JwtClaims } from "@/lib/middleware";

export const runtime = "nodejs";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
}

async function handleGet(req: NextRequest, claims: JwtClaims): Promise<Response> {
  try {
    const email = claims.email ?? null;
    if (!email) {
      return Response.json(
        { ok: false, error: "Email not present in token; cannot resolve user id" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ ok: false, error: "Supabase env not configured" }, { status: 500 });
    }

    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("[Entries API] lookup user error:", userErr.message);
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!userRow?.id) {
      return Response.json(
        { ok: false, error: "User not found in database. Please sign out and sign in again." },
        { status: 404 }
      );
    }

    const topicLimit: number = userRow.topic_limit ?? 5;
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = userRow.last_submission_date
      ? new Date(userRow.last_submission_date).toISOString().slice(0, 10)
      : null;

    const currentDailyCount = (lastDate === today) ? (userRow.daily_submission_count ?? 0) : 0;
    const maxDailySubmissions = 3;
    const remainingDailySubmissions = Math.max(0, maxDailySubmissions - currentDailyCount);

    const { data: userTitle, error: titleError } = await supabase
      .from("topics")
      .select("topic")
      .eq("user_id", userRow.id)
      .maybeSingle();

    if (titleError) {
      console.error("[Entries API] get user_title error:", titleError.message);
      return Response.json({ ok: false, error: titleError.message }, { status: 502 });
    }

    return Response.json({
      ok: true,
      title: userTitle?.topic ?? null,
      topic_limit: topicLimit,
      daily_submission_count: currentDailyCount,
      max_daily_submissions: maxDailySubmissions,
      remaining_daily_submissions: remainingDailySubmissions,
      has_telegram: !!userRow.chat_id,
      chat_id: userRow.chat_id ?? null,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

async function handlePost(req: NextRequest, claims: JwtClaims): Promise<Response> {
  try {
    const body = await req.json().catch(() => null as unknown);
    const content = Array.isArray(body?.content)
      ? body.content.join("\\n")
      : (body?.content ?? "").toString().trim();

    if (!content) {
      return Response.json({ ok: false, error: "Content is required" }, { status: 400 });
    }

    const email = claims.email ?? null;
    if (!email) {
      return Response.json(
        { ok: false, error: "Email not present in token; cannot resolve user id" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ ok: false, error: "Supabase env not configured" }, { status: 500 });
    }

    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("[Entries API] lookup user error:", userErr.message);
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!userRow?.id) {
      return Response.json(
        { ok: false, error: "User not found in database. Please sign out and sign in again." },
        { status: 404 }
      );
    }

    // 0. Verify Telegram bot connection
    if (!userRow.chat_id) {
      return Response.json(
        {
          ok: false,
          error: "You have not connected your Telegram bot yet. Please connect to our Telegram bot first so we can deliver your daily personalized news digests.",
          requires_telegram: true,
        },
        { status: 403 }
      );
    }

    // 1. Enforce Daily Submission Limit (3 times per day)
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = userRow.last_submission_date
      ? new Date(userRow.last_submission_date).toISOString().slice(0, 10)
      : null;

    const currentDailyCount = (lastDate === today) ? (userRow.daily_submission_count ?? 0) : 0;
    const maxDailySubmissions = 3;

    if (currentDailyCount >= maxDailySubmissions) {
      return Response.json(
        {
          ok: false,
          error: "Daily submission limit reached. You can only submit topics up to 3 times per day to prevent spam.",
          daily_limit_reached: true,
          daily_submission_count: currentDailyCount,
          max_daily_submissions: maxDailySubmissions,
          remaining_daily_submissions: 0,
        },
        { status: 429 }
      );
    }

    // 2. Server-side enforcement of the per-user topic limit
    const topicLimit: number = userRow.topic_limit ?? 5;
    const topicCount = content
      .split("\\n")
      .filter((t: string) => t.trim() !== "").length;

    if (topicCount > topicLimit) {
      return Response.json(
        {
          ok: false,
          error: `You can only submit up to ${topicLimit} topic${topicLimit === 1 ? "" : "s"}.`,
          topic_limit: topicLimit,
        },
        { status: 422 }
      );
    }

    const insertPayload = { topic: content, user_id: userRow.id } as const;

    const { data: existingTitle, error: chckError } = await supabase
      .from("topics")
      .select("id,topic")
      .eq("user_id", userRow.id)
      .maybeSingle();

    if (chckError) {
      console.error("[Entries API] insert into topics error:", chckError.message);
      return Response.json({ ok: false, error: chckError.message }, { status: 502 });
    }

    let data;
    let error;
    if (existingTitle) {
      const updateResult = await supabase
        .from("topics")
        .update({ topic: content })
        .eq("user_id", userRow.id)
        .select();
      data = updateResult.data;
      error = updateResult.error;
    } else {
      const insertResult = await supabase.from("topics").insert(insertPayload).select();
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error("[Entries API] insert/update into user_title error:", error.message);
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }

    // Increment daily submission counter
    try {
      await supabase
        .from("users")
        .update({
          daily_submission_count: currentDailyCount + 1,
          last_submission_date: today,
        })
        .eq("id", userRow.id);
    } catch (countErr) {
      console.warn("[Entries API] Could not update daily_submission_count:", countErr);
    }

    // 3. Trigger n8n Webhook with topic_id
    const authHeader = req.headers.get("authorization") || "";
    const n8nWebhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      "https://n8n.tamdan.online/webhook/922f2179-c4b3-45f2-bc82-839447024457";

    const topicRecordId = data?.[0]?.id || existingTitle?.id || null;

    let webhookStatus: { ok: boolean; status?: number; error?: string; topic_id?: string | number } | null = null;
    if (topicRecordId && n8nWebhookUrl) {
      try {
        const n8nPayload = {
          topic_id: topicRecordId,
        };

        const n8nRes = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify(n8nPayload),
        });

        webhookStatus = {
          ok: n8nRes.ok,
          status: n8nRes.status,
          topic_id: topicRecordId,
        };
      } catch (webhookErr) {
        console.error("[Entries API] n8n webhook error:", webhookErr);
        webhookStatus = {
          ok: false,
          error: webhookErr instanceof Error ? webhookErr.message : String(webhookErr),
          topic_id: topicRecordId,
        };
      }
    }

    const remaining = Math.max(0, maxDailySubmissions - (currentDailyCount + 1));
    return Response.json({
      ok: true,
      topics: data?.[0] ?? null,
      remaining_daily_submissions: remaining,
      daily_submission_count: currentDailyCount + 1,
      webhook_triggered: !!webhookStatus?.ok,
      webhook_status: webhookStatus,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
