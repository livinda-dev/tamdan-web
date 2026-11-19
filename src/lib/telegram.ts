// src/lib/telegram.ts

export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "9143623235:AAHG-tXzwP-rQnYxBo02mTIntIBtx9ltIlM";

export const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://tamdan.online";

export const MAX_TELEGRAM_MESSAGE_LENGTH = 4096;

/**
 * Converts general HTML (from n8n or AI) to Telegram-supported HTML.
 * Telegram supports: <b>, <strong>, <i>, <em>, <u>, <ins>, <s>, <strike>, <del>, <a href="...">, <code>, <pre>, <blockquote>
 */
export function convertHtmlToTelegram(html: string): string {
  if (!html) return "";

  let cleaned = html;

  // 1. Remove dangerous or unsupported media/metadata tags
  cleaned = cleaned.replace(/<(?:script|style|img|svg|iframe|head|meta)[^>]*>[\s\S]*?<\/(?:script|style|img|svg|iframe|head|meta)>/gi, "");
  cleaned = cleaned.replace(/<(?:img|meta|link)[^>]*\/?>/gi, "");

  // 2. Headings -> <b>
  cleaned = cleaned.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n\n<b>$1</b>\n\n");

  // 3. List items -> • bullet points
  cleaned = cleaned.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n• $1\n");

  // 4. Line breaks and paragraphs
  cleaned = cleaned.replace(/<br\s*\/?>/gi, "\n");
  cleaned = cleaned.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
  cleaned = cleaned.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "\n$1\n");

  // 5. Clean <a> tags to only keep href
  cleaned = cleaned.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '<a href="$1">$2</a>');

  // 6. Strip all other attributes from allowed tags (e.g. style="...", class="...")
  cleaned = cleaned.replace(/<(b|strong|i|em|u|ins|s|strike|del|code|pre|blockquote)\b[^>]*>/gi, "<$1>");

  // 7. Remove any other unsupported tags (leaving their inner text)
  const allowedTags = "b|strong|i|em|u|ins|s|strike|del|a|code|pre|blockquote";
  const disallowedRegex = new RegExp(`<(?!\\/?(?:${allowedTags})(?:\\s+[^>]*)?>)[^>]+>`, "gi");
  cleaned = cleaned.replace(disallowedRegex, "");

  // 8. Clean up multiple newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  return cleaned;
}

/**
 * Splits a long string into chunks that fit within Telegram's 4096-character limit.
 */
export function splitIntoChunks(text: string, maxLen = MAX_TELEGRAM_MESSAGE_LENGTH): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    let splitPos = remaining.lastIndexOf("\n", maxLen);
    if (splitPos === -1 || splitPos < maxLen / 2) {
      splitPos = remaining.lastIndexOf(" ", maxLen);
    }
    if (splitPos === -1) {
      splitPos = maxLen;
    }

    const chunk = remaining.slice(0, splitPos).trim();
    if (chunk) chunks.push(chunk);
    remaining = remaining.slice(splitPos).trimStart();
  }

  if (remaining.trim()) {
    chunks.push(remaining.trim());
  }

  return chunks;
}

export interface SendMessageOptions {
  parse_mode?: "HTML" | "Markdown";
  disable_web_page_preview?: boolean;
}

/**
 * Sends a message to a Telegram chat with automatic plain-text fallback if HTML entity parsing fails.
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: SendMessageOptions = { parse_mode: "HTML", disable_web_page_preview: false }
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode,
        disable_web_page_preview: options.disable_web_page_preview,
      }),
    });

    if (res.ok) {
      return { ok: true, status: res.status };
    }

    const errorJson = await res.json().catch(() => ({}));
    console.warn(`[Telegram] Send failed with parse_mode=${options.parse_mode}:`, errorJson);

    // Fallback: If HTML parse error, strip tags and send as plain text
    if (options.parse_mode === "HTML") {
      const plainText = text.replace(/<[^>]+>/g, "");
      const fallbackRes = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: plainText,
          disable_web_page_preview: options.disable_web_page_preview,
        }),
      });

      if (fallbackRes.ok) {
        return { ok: true, status: fallbackRes.status };
      }
      const fallbackError = await fallbackRes.json().catch(() => ({}));
      return { ok: false, status: fallbackRes.status, error: JSON.stringify(fallbackError) };
    }

    return { ok: false, status: res.status, error: JSON.stringify(errorJson) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}
