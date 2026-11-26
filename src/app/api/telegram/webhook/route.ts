// src/app/api/telegram/webhook/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendTelegramMessage,
  SITE_URL,
} from "@/lib/telegram";

export const runtime = "nodejs";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase URL or Service Role Key");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function GET() {
  return Response.json({
    status: "ok",
    message: "Telegram bot serverless webhook is active on Vercel",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json().catch(() => null);
    if (!update) {
      return Response.json({ status: "no body" }, { status: 400 });
    }

    const message = update.message || update.edited_message;
    if (!message || !message.chat?.id) {
      return Response.json({ status: "no message" });
    }

    const chatId = message.chat.id;
    const rawText = (message.text || "").trim();
    const cmdLower = rawText.toLowerCase();

    const supabase = getSupabase();

    // ==========================================
    // 1. Handle /start [token_or_phone]
    // ==========================================
    if (cmdLower.startsWith("/start")) {
      const parts = rawText.split(/\s+/, 2);

      if (parts.length === 2) {
        const tokenOrPhone = parts[1].trim();

        // Case A: Token-based linking (generated from website)
        if (tokenOrPhone.length === 64) {
          try {
            // Look up the token
            const { data: tokenData, error: tokenErr } = await supabase
              .from("telegram_tokens")
              .select("*")
              .eq("token", tokenOrPhone)
              .maybeSingle();

            if (tokenErr || !tokenData) {
              await sendTelegramMessage(
                chatId,
                "❌ <b>Invalid Connection Link</b>\n\n" +
                "This link was not found. Please click <b>Connect Telegram</b> on the website to generate a fresh link.",
                { parse_mode: "HTML" }
              );
              return Response.json({ status: "invalid_token" });
            }

            // Check if already used
            if (tokenData.used) {
              await sendTelegramMessage(
                chatId,
                "⚠️ <b>Link Already Used</b>\n\n" +
                "This link has already been used. Please click <b>Connect Telegram</b> on the website to generate a fresh link.",
                { parse_mode: "HTML" }
              );
              return Response.json({ status: "token_already_used" });
            }

            // Check expiration
            const expiresAt = new Date(tokenData.expires_at);
            if (new Date() > expiresAt) {
              await sendTelegramMessage(
                chatId,
                "⌛ <b>Link Expired</b>\n\n" +
                "This connection link has expired (links are valid for 15 minutes). Please generate a fresh link from the website.",
                { parse_mode: "HTML" }
              );
              return Response.json({ status: "token_expired" });
            }

            const phoneNumber = tokenData.phone_number;

            // Verify that this phone number exists in the users table
            const { data: targetUser } = await supabase
              .from("users")
              .select("id, phone_number, chat_id")
              .eq("phone_number", phoneNumber)
              .maybeSingle();

            if (!targetUser) {
              await sendTelegramMessage(
                chatId,
                `❌ <b>Wrong Phone Number</b>\n\n` +
                `The phone number associated with this link (<b>${phoneNumber}</b>) is not registered in our database.\n\n` +
                `Please check your Profile at <a href="${SITE_URL}/profile">${SITE_URL}/profile</a> to ensure your phone number is saved correctly.`,
                { parse_mode: "HTML" }
              );
              return Response.json({ status: "phone_not_found" });
            }

            // Check if this Telegram account is already linked to a DIFFERENT phone number
            const { data: existingUser } = await supabase
              .from("users")
              .select("id, phone_number, chat_id")
              .eq("chat_id", String(chatId))
              .maybeSingle();

            if (existingUser && existingUser.phone_number !== phoneNumber) {
              await sendTelegramMessage(
                chatId,
                `❌ <b>Wrong Phone Number / Account Mismatch</b>\n\n` +
                `Your Telegram account is currently connected to <b>${existingUser.phone_number}</b>, but you are trying to link it to <b>${phoneNumber}</b>.\n\n` +
                `• If you want to connect to <b>${phoneNumber}</b>, send <code>/unlink</code> first to disconnect this Telegram account, then click the link again.\n` +
                `• Or make sure you are using the Telegram account registered with that phone number.`,
                { parse_mode: "HTML" }
              );
              return Response.json({ status: "phone_mismatch" });
            }

            if (existingUser && existingUser.phone_number === phoneNumber) {
              await sendTelegramMessage(
                chatId,
                `✅ <b>Already Connected!</b>\n\n` +
                `Your Telegram account is already linked to <b>${phoneNumber}</b>.\n\n` +
                `Daily news will be sent to you at 7:00 AM every day based on your selected topics.`,
                { parse_mode: "HTML" }
              );
              return Response.json({ status: "already_linked" });
            }

            // Link chat_id to user in users table
            const { error: updateErr } = await supabase
              .from("users")
              .update({ chat_id: String(chatId) })
              .eq("phone_number", phoneNumber);

            if (updateErr) {
              console.error("[Telegram Webhook] Failed to update chat_id:", updateErr.message);
              await sendTelegramMessage(chatId, "⚠️ Server error updating connection. Please try again.");
              return Response.json({ status: "db_error" });
            }

            // Mark token as used
            await supabase
              .from("telegram_tokens")
              .update({ used: true })
              .eq("token", tokenOrPhone);

            await sendTelegramMessage(
              chatId,
              `✅ <b>Successfully linked to ${phoneNumber}!</b>\n\n` +
              `You will now receive your daily personalized news summaries here at 7:00 AM.\n\n` +
              `Type <b>/topics</b> to view your active news topics.`,
              { parse_mode: "HTML" }
            );

            return Response.json({ status: "linked_via_token" });
          } catch (tokenException) {
            console.error("[Telegram Webhook] Token verification exception:", tokenException);
            await sendTelegramMessage(chatId, "⚠️ Server error. Please try again later.");
            return Response.json({ status: "error" });
          }
        }

        // Case B: Fallback manual phone linking (/start 012345678)
        const phoneNumber = tokenOrPhone;
        try {
          const { data: userCheck } = await supabase
            .from("users")
            .select("id, phone_number")
            .eq("phone_number", phoneNumber)
            .maybeSingle();

          if (!userCheck) {
            await sendTelegramMessage(
              chatId,
              `❌ <b>Wrong Phone Number</b>\n\n` +
              `The phone number <b>${phoneNumber}</b> is not registered in our database.\n\n` +
              `Please sign in first at:\n${SITE_URL}`,
              { parse_mode: "HTML" }
            );
            return Response.json({ status: "phone_not_found" });
          }

          // Check if this Telegram account is already linked to another number
          const { data: existingUser } = await supabase
            .from("users")
            .select("id, phone_number, chat_id")
            .eq("chat_id", String(chatId))
            .maybeSingle();

          if (existingUser && existingUser.phone_number !== phoneNumber) {
            await sendTelegramMessage(
              chatId,
              `❌ <b>Wrong Phone Number / Account Mismatch</b>\n\n` +
              `Your Telegram account is currently connected to <b>${existingUser.phone_number}</b>, but you are trying to link it to <b>${phoneNumber}</b>.\n\n` +
              `To link to <b>${phoneNumber}</b>, send <code>/unlink</code> first, then try again.`,
              { parse_mode: "HTML" }
            );
            return Response.json({ status: "phone_mismatch" });
          }

          await supabase
            .from("users")
            .update({ chat_id: String(chatId) })
            .eq("phone_number", phoneNumber);

          await sendTelegramMessage(chatId, "✅ <b>Linked successfully!</b>", { parse_mode: "HTML" });
          return Response.json({ status: "linked" });
        } catch (phoneErr) {
          console.error("[Telegram Webhook] Phone link error:", phoneErr);
          await sendTelegramMessage(chatId, "⚠️ Server error. Please try again.");
          return Response.json({ status: "db_error" });
        }
      }

      // Check if user is already linked when /start is called without parameter
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("phone_number")
          .eq("chat_id", String(chatId))
          .maybeSingle();

        if (existingUser?.phone_number) {
          await sendTelegramMessage(
            chatId,
            `✅ You're already connected to TAMDAN!\n\n` +
            `Linked phone number: <b>${existingUser.phone_number}</b>\n\n` +
            `You'll receive news updates here automatically at 7:00 AM every day based on your selected topics.\n\n` +
            `Type <b>/topics</b> to view your topics, or <b>/unlink</b> to disconnect this account.`,
            { parse_mode: "HTML" }
          );
          return Response.json({ status: "already_linked" });
        }
      } catch (err) {
        console.error("[Telegram Webhook] Error checking existing user:", err);
      }

      // /start with no parameter
      await sendTelegramMessage(
        chatId,
        `👋 <b>Welcome to TAMDAN!</b>\n\n` +
        `To link your account:\n` +
        `1. Sign in at <a href="${SITE_URL}">${SITE_URL}</a>\n` +
        `2. Click <b>"Connect Telegram"</b> on the website\n\n` +
        `Or manually send: <code>/start your_phone_number</code>`,
        { parse_mode: "HTML" }
      );
      return Response.json({ status: "start_no_param" });
    }

    // ==========================================
    // 2. Handle /help
    // ==========================================
    if (cmdLower === "/help" || cmdLower === "help") {
      await sendTelegramMessage(
        chatId,
        `🤖 <b>TAMDAN News Bot Commands</b>\n\n` +
        `• <b>/topics</b> — View your active news topics\n` +
        `• <b>/start</b> — Check connection status\n` +
        `• <b>/unlink</b> — Disconnect this Telegram account\n` +
        `• <b>/help</b> — Show this help message\n\n` +
        `📰 <b>About TAMDAN:</b>\n` +
        `We curate AI-summarized news digests every day at 7:00 AM based on your selected interests.\n\n` +
        `🌐 Manage your topics & profile: <a href="${SITE_URL}">${SITE_URL}</a>`,
        { parse_mode: "HTML" }
      );
      return Response.json({ status: "help_sent" });
    }

    // ==========================================
    // 3. Handle /topics
    // ==========================================
    if (cmdLower === "/topics" || cmdLower === "/mytopics" || cmdLower === "topics") {
      try {
        const { data: user } = await supabase
          .from("users")
          .select("id, phone_number")
          .eq("chat_id", String(chatId))
          .maybeSingle();

        if (!user) {
          await sendTelegramMessage(
            chatId,
            `❌ <b>Not Connected</b>\n\n` +
            `Your Telegram account is not linked to TAMDAN yet.\n\n` +
            `Please sign in and connect at: <a href="${SITE_URL}">${SITE_URL}</a>`,
            { parse_mode: "HTML" }
          );
          return Response.json({ status: "not_linked" });
        }

        const { data: topicsData } = await supabase
          .from("topics")
          .select("topic")
          .eq("user_id", user.id)
          .maybeSingle();

        const rawTopics = topicsData?.topic || "";
        const cleanedTopics = rawTopics
          .split("\n")
          .map((line: string) => line.replace(/^[•\-]\s*/, "").trim())
          .filter((line: string) => line.length > 0);

        if (cleanedTopics.length > 0) {
          const topicBullets = cleanedTopics.map((t: string) => `• <b>${t}</b>`).join("\n");
          await sendTelegramMessage(
            chatId,
            `📌 <b>Your Subscribed Topics:</b>\n\n` +
            `${topicBullets}\n\n` +
            `⏰ <i>Daily personalized news digests are delivered every morning at 7:00 AM.</i>\n\n` +
            `👉 <a href="${SITE_URL}/interest">Click here to edit your topics</a>`,
            { parse_mode: "HTML", disable_web_page_preview: true }
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `📌 <b>No Topics Found</b>\n\n` +
            `You haven't added any topics yet!\n\n` +
            `👉 <a href="${SITE_URL}/interest">Click here to choose your news topics</a>`,
            { parse_mode: "HTML", disable_web_page_preview: true }
          );
        }

        return Response.json({ status: "topics_sent" });
      } catch (err) {
        console.error("[Telegram Webhook] Error fetching topics:", err);
        await sendTelegramMessage(chatId, "⚠️ Failed to fetch your topics. Please try again later.");
        return Response.json({ status: "error" });
      }
    }

    // ==========================================
    // 4. Handle /unlink
    // ==========================================
    if (cmdLower === "/unlink" || cmdLower === "unlink") {
      try {
        const { data: userToUnlink } = await supabase
          .from("users")
          .select("id, phone_number")
          .eq("chat_id", String(chatId))
          .maybeSingle();

        if (!userToUnlink) {
          await sendTelegramMessage(
            chatId,
            "ℹ️ This Telegram account is not currently linked to any TAMDAN account."
          );
          return Response.json({ status: "not_linked" });
        }

        await supabase
          .from("users")
          .update({ chat_id: null })
          .eq("id", userToUnlink.id);

        await sendTelegramMessage(
          chatId,
          `✅ <b>Unlinked successfully!</b>\n\n` +
          `Your Telegram account has been disconnected from <b>${userToUnlink.phone_number}</b>.\n\n` +
          `You can now connect this Telegram account to another phone number from the website: <a href="${SITE_URL}">${SITE_URL}</a>`,
          { parse_mode: "HTML" }
        );
        return Response.json({ status: "unlinked" });
      } catch (unlinkErr) {
        console.error("[Telegram Webhook] Unlink error:", unlinkErr);
        await sendTelegramMessage(chatId, "⚠️ Failed to unlink account. Please try again.");
        return Response.json({ status: "error" });
      }
    }

    // ==========================================
    // 5. Default Echo
    // ==========================================
    await sendTelegramMessage(
      chatId,
      `You said: ${rawText}\n\n` +
      `Type <b>/help</b> to see available commands or <b>/topics</b> to view your news interests.`,
      { parse_mode: "HTML" }
    );

    return Response.json({ status: "ok" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Telegram Webhook] Fatal error:", message);
    return Response.json({ status: "fatal_error", error: message }, { status: 500 });
  }
}
