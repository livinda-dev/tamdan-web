"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/alert";
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

  const fetchEntries = async (token: string) => {
    try {
      const res = await fetch("/api/entries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.ok) {
        const dbContent = json.title || ""; // comma separated from DB
        setSavedContent(dbContent);
        if (dbContent) {
          const withDashes = dbContent
            .split('\\n')
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
      const claims = decodeJwtPayload<{ email?: string }>(session.id_token);
      setUserEmail(claims?.email ?? null);
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



    // ❌ Block if more than 5 topics
    if (arrayContent.length > 5) {
      setStatus("You can only submit up to 5 topics.");
      return;
    }

    if (arrayContent.length === 0) {
      setStatus("Please enter at least 1 topic.");
      return;
    }

    setSubmitting(true); // show loading overlay

    for (const topic of arrayContent) {
      const res = await fetch("/api/moderate-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const json = await res.json();

      if (json.status === "UNSAFE") {
        setSubmitting(false); // hide loading
        setAlertText(
          `❌ Topic not allowed:\n"${topic}"\n\nReason: ${json.reason}`
        );
        setAlertStatus("error");
        setIsAlertOpen(true);
        return;
      }
    }

    setSubmitting(true);
    setStatus(null);

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
        setStatus(json.error || "Failed to submit");
      } else {
        setStatus("Submitted successfully!");
        setSavedContent(arrayContent.join("\n"));
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
              value={content}
              maxLength={800}
              className="w-full h-64 sm:h-72 md:h-80 px-4 sm:px-6 md:px-9 py-4 sm:py-6 md:py-8 bg-white font-tamdan-placeholder leading-relaxed"
              onChange={(e) => {
                const value = e.target.value;

                // Split lines and strip any leading bullets/dashes for checking user input.
                const rawLines = value.split("\n");
                const strippedLines = rawLines.map((line) =>
                  line.replace(/^[•\-]\s?/, "")
                );

                // Check for disallowed dot-like characters in the user's content
                // after removing bullets we insert programmatically. This avoids
                // flagging the `• ` we add ourselves when formatting lines.
                const hasInvalidChar = strippedLines.some((line) =>
                  /[·●◦.,]/.test(line)
                );

                // If user typed disallowed characters, notify and remove them
                let cleanedLines = strippedLines.slice();
                if (hasInvalidChar) {
                  setAlertText(
                    "Please avoid using dot characters like '·', '●', '◦', or '.' and ','. They have been removed."
                  );
                  setAlertStatus("error");
                  setIsAlertOpen(true);

                  cleanedLines = cleanedLines.map((l) =>
                    l.replace(/[·•●◦.,]/g, "")
                  );
                }

                // Rebuild lines preserving blank lines (use cleaned content for non-blank)
                let lines = rawLines.map((orig, idx) =>
                  orig.trim() === "" ? "" : cleanedLines[idx] ?? ""
                );

                // Count only non-empty lines (ignore blank lines)
                const nonEmptyCount = lines.filter((l) => l.trim() !== "")
                  .length;

                if (nonEmptyCount > 5) {
                  setAlertText("You can only submit up to 5 topics.");
                  setAlertStatus("error");
                  setIsAlertOpen(true);

                  // keep only first 5 non-empty lines, but allow blank lines
                  let count = 0;
                  lines = lines.filter((line) => {
                    if (line.trim() === "") return true;
                    if (count < 5) {
                      count++;
                      return true;
                    }
                    return false;
                  });
                }

                const formatted = lines
                  .map((line) => {
                    // Allow blank lines normally
                    if (line.trim() === "") return "";

                    // Limit each line to 150 characters
                    const limited = line.slice(0, 150);

                    // Final line must always start with "• "
                    return `• ${limited}`;
                  })
                  .join("\n");

                setContent(formatted);
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
        </form>
        <div className="flex justify-center mt-2 sm:mt-3 md:mt-4">
          {status && <span className="text-xs sm:text-sm text-gray-700">{status}</span>}
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
