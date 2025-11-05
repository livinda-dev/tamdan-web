"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";

function decodeJwtPayload<T = unknown>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    const json = typeof window !== "undefined"
      ? decodeURIComponent(escape(window.atob(padded)))
      : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export default function SubmitPage() {
  const router = useRouter();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem("session");
  //     if (!raw) {
  //       router.replace("/landing");
  //       return;
  //     }
  //     const session = JSON.parse(raw) as { id_token?: string };
  //     if (!session?.id_token) {
  //       router.replace("/landing");
  //       return;
  //     }
  //     setIdToken(session.id_token);
  //     const claims = decodeJwtPayload<{ email?: string }>(session.id_token);
  //     setUserEmail(claims?.email ?? null);
  //   } catch (e) {
  //     console.error("Failed to read session", e);
  //     router.replace("/landing");
  //   }
  // }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) {
      setStatus("Not authenticated");
      return;
    }
    if (!content.trim()) {
      setStatus("Please enter something to submit.");
      return;
    }
    setSubmitting(true);
    setStatus(null);
      const arrayContent = content.split("\n").map(line => line.trim()).filter(line => line.length > 0);
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
        setContent("");
      }
    } catch (e: unknown) {
      setStatus("Network error");
        // setStatus(e?.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Submit Content</h1>
        <p className="text-sm text-gray-600 mb-6">Signed in as: {userEmail ?? "Unknown"}</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Write something to save in Supabase..."
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            {status && <span className="text-sm text-gray-700">{status}</span>}
          </div>
        </form>
      </div>
    </main>
  );
}
