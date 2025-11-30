"use client";

import React, { useEffect, useState, useRef } from "react";
import GoogleSignInModal from "@/components/googleButton";
import GenerateAgentButton from "@/components/GenerateAgentButton";
import { useRouter } from "next/navigation";
import Alert from "@/components/alert";

export default function NoAuthLandingPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
  const [charLimitWarning, setCharLimitWarning] = useState(false);
  const [topicLimitWarning, setTopicLimitWarning] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      setIsGoogleModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-6">
      {/* Title */}
      <div className="max-w-4xl w-full">
        <p className="text-color text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-[TamdanRegular] mt-4 sm:mt-6">
          Discover smarter searching with{" "}
          <span className="font-bold primary-color text-lg sm:text-xl md:text-2xl lg:text-3xl">TAMDAN</span>
        </p>
        {/* Subtitle */}
        <p className="text-color text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-[TamdanRegular] mt-4 mb-8 sm:mb-10">
          an AI-powered agent that understands you better every time.
        </p>

        {/* Input Section */}
        <div className="w-full max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm md:text-base text-color mb-4 sm:mb-6 text-center">
            _____Write your interests here_____
          </p>
          <form onSubmit={onSubmit}>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                className="w-full h-56 sm:h-64 md:h-72 lg:h-80 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 pb-16 sm:pb-20 bg-white font-tamdan-placeholder leading-relaxed overflow-y-auto"
                onChange={(e) => {
                  const value = e.target.value;

                  const lines = value.split("\n");

                  // Count only non-empty lines (ignore blank lines)
                  const nonEmptyCount = lines.filter(
                    (l) => l.trim() !== ""
                  ).length;

                  // If already at 5 topics, prevent adding more non-empty lines
                  if (nonEmptyCount > 5) {
                    setTopicLimitWarning(true);
                    // Block the new input - keep previous content
                    return;
                  } else {
                    setTopicLimitWarning(false);
                  }

                  let hitLimit = false;
                  const formatted = lines
                    .map((line) => {
                      // Allow blank lines normally
                      if (line.trim() === "") return "";

                      // Remove ONLY one leading bullet + optional space OR dash
                      const withoutBullet = line.replace(/^[•\-]\s?/, "");

                      // Limit each line to 80 characters
                      const limited = withoutBullet.slice(0, 80);

                      // Check if limit was reached
                      if (withoutBullet.length > 80) {
                        hitLimit = true;
                      }

                      // Final line must always start with "• "
                      return `•${limited}`;
                    })
                    .join("\n");

                  setCharLimitWarning(hitLimit);
                  setContent(formatted);

                  // Auto-scroll to bottom after content update
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
                    }
                  }, 0);
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

              {(charLimitWarning || topicLimitWarning) && (
                <div className="absolute top-2 right-2 text-red-800 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  {topicLimitWarning && "⚠ Max 5 topics"}
                  {!topicLimitWarning &&
                    charLimitWarning &&
                    "⚠ Line limit"}
                </div>
              )}

              <GenerateAgentButton submitting={submitting} onSubmit={onSubmit} />
            </div>
          </form>
          <div className="flex justify-center mt-2 sm:mt-3">
            {status && <span className="text-xs sm:text-sm text-gray-700">{status}</span>}
          </div>
          <p className="text-xs sm:text-sm md:text-base text-color mb-6 text-center font-[TamdanAddition] mt-2 sm:mt-3">
            Find Better. Faster. With TAMDAN.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-[#EFF0EC] px-4 sm:px-6 md:px-12 lg:px-[120px] py-8 sm:py-10 md:py-12 mt-8 sm:mt-12 md:mt-16">
        <div className="max-w-4xl mx-auto">
          {/* About TAMDAN */}
          <div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed font-normal text-[#1A1A1A]">
              <span className="float-left text-4xl sm:text-5xl md:text-6xl font-[TamdanBold] leading-[0.8] mr-2 sm:mr-3 mt-1">
                T
              </span>
              AMDAN is an intelligent, AI-powered search companion designed to
              keep you informed and connected. Powered by advanced technologies
              like GPT-5 and n8n automation, TAMDAN goes beyond ordinary search —
              it gathers real-time news, analyzes trusted sources, and delivers
              personalized insights that matter to you.
            </p>
          </div>

          {/* Alert Info */}
          <div className="mt-6 sm:mt-8 md:mt-10">
            <p className="text-sm sm:text-base md:text-lg leading-relaxed">
              Stay ahead effortlessly with instant alerts through Telegram chatbot
              notifications or in-app messages whenever new updates match your
              interests.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="flex flex-col sm:flex-col lg:flex-row justify-between gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8 md:mt-10">
            <div className="flex items-center space-x-3 bg-white px-4 sm:px-6 py-4 sm:py-6 w-full lg:w-auto">
              <img
                src="/image/telegram.png"
                alt="Telegram"
                className="h-8 sm:h-10 w-auto flex-shrink-0"
              />
              <p className="text-sm sm:text-base md:text-lg font-medium">TELEGRAM CHATBOT</p>
            </div>

            <div className="flex items-center space-x-3 bg-white px-4 sm:px-6 py-4 sm:py-6 w-full lg:w-auto">
              <img src="/image/gmail.png" alt="Gmail" className="h-8 sm:h-10 w-auto flex-shrink-0" />
              <p className="text-sm sm:text-base md:text-lg font-medium">ALERT BY GMAIL</p>
            </div>

            <div className="flex items-center space-x-3 bg-white px-4 sm:px-6 py-4 sm:py-6 w-full lg:w-auto">
              <img src="/image/sms.png" alt="SMS" className="h-8 sm:h-10 w-auto flex-shrink-0" />
              <p className="text-sm sm:text-base md:text-lg font-medium">SMS MESSAGE APP</p>
            </div>
          </div>

          {/* Closing Text */}
          <div className="mt-6 sm:mt-8 md:mt-10">
            <p className="text-sm sm:text-base md:text-lg leading-relaxed">
              Whether it is daily news, research insights, or topic-specific
              trends, TAMDAN ensures you never miss what is important — your
              intelligent search partner, powered by AI.
            </p>
          </div>
        </div>
      </div>

      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
      <Alert
        text={alertText}
        status={alertStatus}
        isOpen={isALertOpen}
        onClose={() => setIsAlertOpen(false)}
      />
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white px-6 sm:px-8 py-6 sm:py-8 rounded-xl shadow-lg text-center max-w-sm w-full mx-4">
            <div className="loader border-4 border-gray-300 border-t-blue-500 rounded-full w-10 sm:w-12 h-10 sm:h-12 mx-auto animate-spin"></div>
            <p className="mt-4 text-gray-700 text-sm sm:text-base font-medium">
              Checking your topics...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
