"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/alert";
import { useRef } from "react";

import GenerateAgentButton from "@/components/GenerateAgentButton";

function decodeJwtPayload<T = unknown>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(escape(window.atob(padded)))
        : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export default function AuthInterestPage() {
  const router = useRouter();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isALertOpen, setIsAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertStatus, setAlertStatus] = useState<"error" | "success" | "info">(
    "info"
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Dynamic topic limit fetched from the server (admin-controlled per user)
  const [topicLimit, setTopicLimit] = useState(5);
  // Daily submission quota (max 3 times per day)
  const [remainingDailySubmissions, setRemainingDailySubmissions] = useState<number | null>(null);
  // Telegram connection check
  const [hasTelegram, setHasTelegram] = useState<boolean | null>(null);
  const [telegramPromptOpen, setTelegramPromptOpen] = useState(false);
  const [connectingTelegram, setConnectingTelegram] = useState(false);

  const handleConnectTelegram = async () => {
    if (!idToken) return;
    setConnectingTelegram(true);

    try {
      const res = await fetch("/api/bots/generate-telegram-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });

      const json = await res.json();
      if (json.ok && json.token) {
        window.open(`https://t.me/tam_dan_news_bot?start=${json.token}`, "_blank");
        setTelegramPromptOpen(false);
      } else {
        setAlertText(json.error || "Failed to generate Telegram connect link.");
        setAlertStatus("error");
        setIsAlertOpen(true);
      }
    } catch (err) {
      console.error("Telegram connect error:", err);
      setAlertText("Failed to connect Telegram. Please try again.");
      setAlertStatus("error");
      setIsAlertOpen(true);
    } finally {
      setConnectingTelegram(false);
    }
  };

  const fetchEntries = async (token: string) => {
    try {
      const res = await fetch("/api/entries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.ok) {
        // Read the admin-controlled per-user topic limit
        if (typeof json.topic_limit === "number" && json.topic_limit >= 1) {
          setTopicLimit(json.topic_limit);
        }
        if (typeof json.remaining_daily_submissions === "number") {
          setRemainingDailySubmissions(json.remaining_daily_submissions);
        }
        if (typeof json.has_telegram === "boolean") {
          setHasTelegram(json.has_telegram);
        }
        const dbContent = json.title || ""; // comma separated from DB
        setSavedContent(dbContent);
        if (dbContent) {
          const withDashes = dbContent
            .split("\\n")
            .map((t: string) => `• ${t.trim()}`)
            .join("\n");

          setContent(withDashes);
        } else {
          setContent("");
        }
      } else {
        setContent("");
      }
    } catch (e) {
      console.error("Failed to fetch entries", e);
      setContent("");
    }
  };

  // const fetchNews  = async (token: string) => {
  //   try {
  //     const res = await fetch("/api/news", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const json = await res.json();
  //     if (json.ok) {
  //       console.log("Fetched news:", json);
  //     } else {
  //       console.error("Failed to fetch news:", json.error);
  //     }
  //   } catch (e) {
  //     console.error("Failed to fetch news", e);
  //   }
  // }

  useEffect(() => {
    if (idToken) {
      fetchEntries(idToken);
      // fetchNews(idToken);
    }
  }, [idToken]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        router.replace("/");
        return;
      }
      const session = JSON.parse(raw) as { id_token?: string };
      if (!session?.id_token) {
        setIsGoogleModalOpen(true);
        return;
      }
      setIdToken(session.id_token);
      const claims = localStorage.getItem("email");
      setUserEmail(claims ?? null);
    } catch (e) {
      console.error("Failed to read session", e);
      setIsGoogleModalOpen(true);
    }
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idToken) {
      setIsGoogleModalOpen(true);
      return;
    }

    const arrayContent = content
      .split("\n")
      .map((line) => line.replace(/^•\s*/, "").trim())
      .filter((line) => line.length > 0);

    // ❌ Block if more than the user's allowed topic limit
    if (arrayContent.length > topicLimit) {
      setStatus(`You can only submit up to ${topicLimit} topic${topicLimit === 1 ? "" : "s"}.`);
      return;
    }

    if (arrayContent.length === 0) {
      setStatus("Please enter at least 1 topic.");
      return;
    }

    // ❌ Block if user already used their 3 submissions today
    if (remainingDailySubmissions !== null && remainingDailySubmissions <= 0) {
      setAlertText(
        "⚠️ Daily limit reached!\nYou can only submit topics up to 3 times per day to prevent spam. Please come back tomorrow."
      );
      setAlertStatus("error");
      setIsAlertOpen(true);
      return;
    }

    // ❌ Block if user has not connected Telegram yet
    if (hasTelegram === false) {
      setTelegramPromptOpen(true);
      return;
    }

    setSubmitting(true); // show loading overlay
    setStatus(null);

    // Run topic moderation check using OpenRouter
    for (const topic of arrayContent) {
      try {
        const res = await fetch("/api/moderate-topic", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ topic }),
        });

        const json = await res.json();

        if (json.status === "UNSAFE") {
          setSubmitting(false); // hide loading
          setAlertText(
            `❌ Topic not allowed:\n"${topic}"\n\nReason: ${json.reason || "Content flagged by moderation."}`
          );
          setAlertStatus("error");
          setIsAlertOpen(true);
          return;
        }
      } catch (modErr) {
        console.error("Moderation check error:", modErr);
      }
    }

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ content: arrayContent }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.requires_telegram) {
          setHasTelegram(false);
          setTelegramPromptOpen(true);
          return;
        }
        setStatus(json.error || "Failed to submit");
        setAlertText(json.error || "Failed to submit topics.");
        setAlertStatus("error");
        setIsAlertOpen(true);
      } else {
        setStatus("Submitted successfully!");
        setSavedContent(arrayContent.join("\n"));
        if (typeof json.remaining_daily_submissions === "number") {
          setRemainingDailySubmissions(json.remaining_daily_submissions);
        }
        if (typeof json.has_telegram === "boolean") {
          setHasTelegram(json.has_telegram);
        }
        setAlertText("✅ Topics submitted successfully!");
        setAlertStatus("success");
        setIsAlertOpen(true);
      }
    } catch {
      setStatus("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 sm:justify-center md:justify-start">
      <div className="w-full max-w-2xl">
        <h2 className="text-lg sm:text-xl md:text-2xl text-gray-700 pt-2 text-center">
          Your Daily Personalized Newsletter.
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-color pt-6 sm:pt-8 md:pt-10 text-center">
          _____Write your interests here_____
        </p>

        <form onSubmit={onSubmit}>
          <div className="relative mt-4 sm:mt-6 md:mt-8">
            <textarea
              disabled={isALertOpen}
              ref={textareaRef}
              value={content}
              maxLength={800}
              className="w-full h-64 sm:h-72 md:h-80 px-4 sm:px-6 md:px-9 py-4 sm:py-6 md:py-8 bg-white font-tamdan-placeholder leading-relaxed"
              onChange={(e) => {
                if (isALertOpen) return;
                const textarea = textareaRef.current;
                if (!textarea) return;

                const cursorStart = textarea.selectionStart;
                const cursorEnd = textarea.selectionEnd;

                const value = e.target.value;

                const rawLines = value.split("\n");
                const strippedLines = rawLines.map((line) =>
                  line.replace(/^[•\-]\s?/, "")
                );

                let cleanedLines = strippedLines.slice();

                const hasInvalidChar = strippedLines.some((line) =>
                  /[·●◦.,]/.test(line)
                );

                if (hasInvalidChar) {
                  setAlertText(
                    "Please avoid using dot characters like '·', '●', '◦', or '.' and ','. They have been removed."
                  );
                  setAlertStatus("error");
                  setIsAlertOpen(true);

                  cleanedLines = cleanedLines.map((l) =>
                    l.replace(/[·●◦.,]/g, "")
                  );
                }

                let lines = rawLines.map((orig, idx) =>
                  orig.trim() === "" ? "" : cleanedLines[idx] ?? ""
                );

                const nonEmptyCount = lines.filter(
                  (l) => l.trim() !== ""
                ).length;

                if (nonEmptyCount > topicLimit) {
                  setAlertText(`You can only submit up to ${topicLimit} topic${topicLimit === 1 ? "" : "s"}.`);
                  setAlertStatus("error");
                  setIsAlertOpen(true);

                  // ❗ DO NOT change content at all
                  requestAnimationFrame(() => {
                    textarea.selectionStart = cursorStart;
                    textarea.selectionEnd = cursorStart;
                  });

                  return; // ⛔ stop processing
                }

                const formatted = lines
                  .map((line) => {
                    if (line.trim() === "") return "";
                    return `• ${line.slice(0, 150)}`;
                  })
                  .join("\n");

                setContent(formatted);

                // ✅ Restore cursor AFTER render
                requestAnimationFrame(() => {
                  const newLength = formatted.length;
                  const oldLength = value.length;
                  const diff = newLength - oldLength;

                  const newCursor = Math.max(0, cursorStart + diff);

                  textarea.selectionStart = newCursor;
                  textarea.selectionEnd = newCursor;
                });
              }}
              rows={5}
              placeholder={
                savedContent
                  ? ""
                  : `• Gold market and Impact
• Cease fire between Israel and Hamas
• Human jobs that AI may eliminate`
              }
            />

            <GenerateAgentButton submitting={submitting} onSubmit={onSubmit} />
          </div>

          {/* Submission quota & topic limit indicators */}
          <div className="flex justify-between items-center text-xs mt-2 px-1 text-gray-500">
            <span>Limit: up to {topicLimit} topics</span>
            {remainingDailySubmissions !== null && (
              <span
                className={`font-medium ${
                  remainingDailySubmissions === 0
                    ? "text-red-500 font-bold"
                    : "text-gray-600"
                }`}
              >
                Daily submissions left: {remainingDailySubmissions} / 3
              </span>
            )}
          </div>
        </form>
        <div className="flex justify-center mt-2 sm:mt-3 md:mt-4">
          {status && (
            <span className="text-xs sm:text-sm text-gray-700">{status}</span>
          )}
        </div>
        <p className="text-xs sm:text-sm md:text-base text-color text-center font-[TamdanAddition] mt-2 sm:mt-3 md:mt-4">
          Find Better. Faster. With TAMDAN.
        </p>
      </div>
      <Alert
        text={alertText}
        status={alertStatus}
        isOpen={isALertOpen}
        onClose={() => setIsAlertOpen(false)}
      />

      {/* Telegram Not Connected Modal Prompt */}
      {telegramPromptOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-200 shadow-2xl animate-fadeIn space-y-4">
            <div className="w-16 h-16 bg-sky-50 border border-sky-100 rounded-full flex items-center justify-center mx-auto text-[#0088cc]">
              <svg className="w-8 h-8 fill-current text-[#0088cc]" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#00355A]">Connect Telegram First</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              You must connect your account to our Telegram bot first so we can deliver your personalized news digests to your Telegram.
            </p>
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleConnectTelegram}
                disabled={connectingTelegram}
                className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {connectingTelegram ? "Connecting..." : "Connect Telegram Bot"}
              </button>
              <button
                type="button"
                onClick={() => setTelegramPromptOpen(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.2s]"></div>
              <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.4s]"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
              Checking your topics...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
