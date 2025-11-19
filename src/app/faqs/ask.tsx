"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInModal from "@/app/landing/googleButton";
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
    <div className=" space-y-[40px]">
      <div>
        <p className="text-[36px]">Got something else you’d like to know?</p>
      </div>
      <div>
        <p>Just ask TAMDAN — your AI assistant is always ready to answer.</p>
      </div>
      <div>
        <div className="w-full px-[90px]">
          <form onSubmit={onSubmit}>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="write your question here..."
                className="w-full h-[320px] px-[35px] py-[30px] bg-white"
              />
              <div className="absolute bottom-4 right-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-[180px] cursor-pointer text-[16px] h-[39px] bg-primary-color text-white px-2 py-2 rounded-md hover:bg-primary-color disabled:opacity-60"
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
