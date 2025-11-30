"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function AskSection() {
  const router = useRouter();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

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

  const claims = decodeJwtPayload<{ email?: string }>(token);
  setUserEmail(claims?.email ?? null);

  if (!content.trim()) {
    setStatus("Please enter something to submit.");
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
      setStatus(json.error || "Failed to submit");
    } else {
      setStatus("Submitted successfully!");
      setContent("");
    }
  } catch (e) {
    setStatus("Network error");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <div>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold">Got something else you would like to know?</p>
      </div>
      <div>
        <p className="text-sm sm:text-base md:text-lg leading-relaxed">Just ask TAMDAN — your AI assistant is always ready to answer.</p>
      </div>
      <div>
        <div className="w-full max-w-4xl mx-auto">
          <form onSubmit={onSubmit}>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="write your question here..."
                className="w-full h-56 sm:h-64 md:h-72 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-white pb-16 sm:pb-20"
              />
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-5 cursor-pointer bg-primary-color text-white hover:bg-primary-color disabled:opacity-60 whitespace-nowrap"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </div>
  );
}
