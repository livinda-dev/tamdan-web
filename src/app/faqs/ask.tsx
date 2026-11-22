"use client";
import React, { useState, useEffect, useCallback } from "react";
import GoogleSignInModal from "@/components/googleButton";

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

interface IQuestionItem {
  id: number;
  question: string;
  answer?: string | null;
  answered_at?: string | null;
  answered_by?: string | null;
  status?: string | null;
  created_at?: string | null;
}

export default function AskSection() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [questions, setQuestions] = useState<IQuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        setIsLoggedIn(false);
        return;
      }

      const session = JSON.parse(raw) as { id_token?: string };
      const token = session?.id_token;
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      setLoadingQuestions(true);

      const res = await fetch("/api/questions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (res.ok && json.ok && Array.isArray(json.questions)) {
        setQuestions(json.questions);
      }
    } catch (err) {
      console.error("Failed to load user questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const raw = localStorage.getItem("session");
    if (!raw) {
      setIsGoogleModalOpen(true);
      return;
    }

    const session = JSON.parse(raw) as { id_token?: string };
    const token = session?.id_token;

    if (!token) {
      setIsGoogleModalOpen(true);
      return;
    }

    if (!content.trim()) {
      setStatus("Please enter a question before submitting.");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setStatus(json.error || "Failed to submit question");
      } else {
        setStatus("Your question was submitted successfully! Our team will review and reply.");
        setContent("");
        // Refresh question list
        fetchQuestions();
      }
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <div>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Got something else you would like to know?
        </p>
      </div>

      <div>
        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-600">
          Have a question or inquiry? Ask TAMDAN and our team will review and reply to you.
        </p>
      </div>

      <div>
        <div className="w-full max-w-4xl mx-auto">
          <form onSubmit={onSubmit}>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Write your question or inquiry here..."
                className="w-full h-44 sm:h-52 md:h-60 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00355A]/20 pb-16 sm:pb-20 text-gray-800"
              />
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-xs sm:text-sm md:text-base h-9 sm:h-10 px-4 sm:px-6 cursor-pointer bg-[#00355A] hover:bg-[#00243C] text-white rounded-lg transition font-medium disabled:opacity-60 whitespace-nowrap shadow-sm"
                >
                  {submitting ? "Submitting..." : "Submit Question"}
                </button>
              </div>
            </div>
          </form>

          {status && (
            <div
              className={`mt-4 p-3.5 rounded-xl text-sm font-medium ${status.includes("successfully")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
                }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* User Question History & Admin Replies Section */}
      {isLoggedIn && (
        <div className="w-full max-w-4xl mx-auto pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-[#00355A]">
              Your Inquiries & Responses
            </h3>
            {loadingQuestions && (
              <span className="text-xs text-gray-500">Loading inquiries...</span>
            )}
          </div>

          {questions.length === 0 && !loadingQuestions ? (
            <div className="p-6 bg-white rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
              You haven&apos;t submitted any questions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Inquiry #{q.id}
                    </span>
                    <div className="flex items-center gap-2">
                      {q.answer ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          ✓ Answered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          ⏳ Pending Review
                        </span>
                      )}
                      {q.created_at && (
                        <span className="text-xs text-gray-400">
                          {new Date(q.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-800 font-medium text-sm sm:text-base leading-relaxed">
                    {q.question}
                  </p>

                  {/* Admin Reply Box */}
                  {q.answer ? (
                    <div className="mt-3 p-4 bg-[#00355A]/5 border-l-4 border-[#00355A] rounded-r-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#00355A]">
                          Reply from TAMDAN Support
                        </span>
                        {q.answered_at && (
                          <span className="text-[11px] text-gray-500">
                            {new Date(q.answered_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line pt-1">
                        {q.answer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Our team will review your question and respond shortly. Responses will appear here and in your connected Telegram account.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </div>
  );
}
