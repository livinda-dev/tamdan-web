"use client";

import React, { useEffect, useState } from "react";
import GoogleSignInModal from "./googleButton";
import GenerateAgentButton from "./GenerateAgentButton";
import { useRouter } from "next/navigation";

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

export default function LandingPage() {
  const router = useRouter();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const defaultPlaceholder = `. Gold market and Impact
. Cease fire between Israel and Hamas
. Human jobs that AI may eliminate`;

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
        setContent(dbContent ? dbContent.split(",").join("\n") : "");
      } else {
        setContent("");
      }
    } catch (e) {
      console.error("Failed to fetch entries", e);
      setContent("");
    }
  };

  useEffect(() => {
    if (idToken) {
      fetchEntries(idToken);
    }
  }, [idToken]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        router.replace("/landing");
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

  const handleOpenGoogle = () => {
    setIsGoogleModalOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) {
      setIsGoogleModalOpen(true);
      return;
    }
    if (!content.trim()) {
      setStatus("Please enter something to submit.");
      return;
    }
    setSubmitting(true);
    setStatus(null);

    // Convert multiline textarea to comma-separated array
    const arrayContent = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

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
        setSavedContent(arrayContent.join(",")); // store comma string
      }
    } catch (e) {
      setStatus("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Title */}
      <p className="text-color tracking-widest text-center text-[36px] font-[TamdanRegular]">
        Discover smarter searching with{" "}
        <span className="font-bold primary-color text-[30px]">TAMDAN</span>
      </p>
      {/* Subtitle */}
      <p className="text-color tracking-widest mb-10 text-center text-[36px] font-[TamdanRegular]">
        an AI-powered agent that understands you better every time.
      </p>

      <div className="w-[744px]">
        <p className="text-[16px] text-color mb-6 text-center ">
          _____Write your interests here_____
        </p>
        <form onSubmit={onSubmit}>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder={savedContent ? "" : defaultPlaceholder}
              className="w-full h-[320px] px-[35px] py-[30px] bg-white"
            />
            <GenerateAgentButton submitting={submitting} onSubmit={onSubmit} />
          </div>
        </form>
        <div className="flex justify-center mt-2">
          {status && <span className="text-sm text-gray-700">{status}</span>}
        </div>
        <p className="text-[16px] text-color mb-6 text-center">
          ““Find Better. Faster. With TAMDAN.””
        </p>
      </div>

      <div className="w-full bg-[#EFF0EC] px-[117px] py-[44px]">
        <div>
          <p className="text-[18px] leading-relaxed font-normal text-[#1A1A1A]">
            <span className="float-left text-[56px] font-[TamdanBold] leading-[0.8] mr-3 mt-1">
              T
            </span>
            AMDAN is an intelligent, AI-powered search companion designed to
            keep you informed and connected. Powered by advanced technologies
            like GPT-5 and n8n automation, TAMDAN goes beyond ordinary search —
            it gathers real-time news, analyzes trusted sources, and delivers
            personalized insights that matter to you.
          </p>
        </div>
        <div className="mt-[44px]">
          <p>
            Stay ahead effortlessly with instant alerts through Telegram chatbot
            notifications or in-app messages whenever new updates match your
            interests.
          </p>
        </div>
        <div className="flex justify-around mt-[44px]">
          <div className="flex items-center space-x-3 bg-white px-[9px] py-[7px] w-[392px] h-[71px] ">
            <img
              src="/image/telegram.png"
              alt="Telegram"
              className="h-auto w-auto"
            />
            <p className="text-[24px]">TELEGRAM CHATBOT</p>
          </div>
          <div className="flex items-center space-x-3 bg-white px-[9px] py-[7px] w-[392px] h-[71px] ">
            <img src="/image/gmail.png" alt="Gmail" className="h-auto w-auto" />
            <p className="text-[24px]">ALERT BY GMAIL</p>
          </div>
          <div className="flex items-center space-x-3 bg-white px-[9px] py-[7px] w-[392px] h-[71px] ">
            <img src="/image/sms.png" alt="SMS" className="h-auto w-auto" />
            <p className="text-[24px]">SMS MESSAGE APP</p>
          </div>
        </div>
        <div className="mt-[44px]">
          <p>
            Whether it’s daily news, research insights, or topic-specific
            trends, TAMDAN ensures you never miss what’s important — your
            intelligent search partner, powered by AI.
          </p>
        </div>
      </div>

      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </div>
  );
}
