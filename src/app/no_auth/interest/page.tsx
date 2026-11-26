"use client";

import React, { useEffect, useState, useRef } from "react";
import GoogleSignInModal from "@/components/googleButton";
import GenerateAgentButton from "@/components/GenerateAgentButton";
import { useRouter } from "next/navigation";
import Alert from "@/components/alert";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

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
  // Default preview limit shown to unauthenticated users.
  // The actual enforced limit is per-user and set by the admin after login.
  const [topicLimit] = useState(5);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      setIsGoogleModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Title */}
      <div className="max-w-6xl w-full">
        <p className="text-color text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-[TamdanRegular] sm:mt-6">
          Discover smarter searching with{" "}
          <span className="font-bold primary-color text-lg sm:text-xl md:text-2xl lg:text-3xl">TAMDAN</span>
        </p>
        {/* Subtitle */}
        <p className="text-color text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-[TamdanRegular] mb-8 sm:mb-10">
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

                  // If already at limit, prevent adding more non-empty lines
                  if (nonEmptyCount > topicLimit) {
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
                  {topicLimitWarning && `⚠ Max ${topicLimit} topics`}
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
          <p className="text-xs sm:text-sm md:text-base text-color mb-6 text-center font-[TamdanAddition] mt-1 sm:mt-3">
            Find Better. Faster. With TAMDAN.
          </p>
        </div>
      </div>

      {/* Features & Value Proposition Section */}
      <section className="w-full bg-gradient-to-b from-[#EFF0EC] to-[#E5E7DF] py-12 sm:py-16 md:py-20 mt-12 sm:mt-16 md:mt-20 border-t border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-xs text-xs sm:text-sm font-semibold text-[#00355A]">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Personalized AI News Intelligence</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#00355A] tracking-tight">
              The News You Care About. <span className="text-amber-600">Zero Noise.</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed font-normal">
              <strong>TAMDAN</strong> is your intelligent AI companion designed to keep you effortlessly informed.
              We continuously scan trusted global and regional news sources, eliminate clickbait and ads, and deliver concise,
              high-signal intelligence tailored specifically to your chosen interests.
            </p>
          </div>

          {/* Key Value Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-10 max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-slate-200/80 shadow-xs text-center space-y-1">
              <Clock className="w-5 h-5 text-[#00355A] mx-auto" />
              <div className="font-bold text-sm sm:text-base text-[#00355A]">7:00 AM Delivery</div>
              <div className="text-[11px] sm:text-xs text-slate-500">Fresh morning briefings</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-slate-200/80 shadow-xs text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="font-bold text-sm sm:text-base text-[#00355A]">Zero Noise & Spam</div>
              <div className="text-[11px] sm:text-xs text-slate-500">Only verified trusted sources</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-slate-200/80 shadow-xs text-center space-y-1">
              <Zap className="w-5 h-5 text-amber-500 mx-auto" />
              <div className="font-bold text-sm sm:text-base text-[#00355A]">Custom AI Topics</div>
              <div className="text-[11px] sm:text-xs text-slate-500">Track whatever matters to you</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-slate-200/80 shadow-xs text-center space-y-1">
              <Bot className="w-5 h-5 text-sky-600 mx-auto" />
              <div className="font-bold text-sm sm:text-base text-[#00355A]">60-Sec Quick Setup</div>
              <div className="text-[11px] sm:text-xs text-slate-500">Connect and let AI do the rest</div>
            </div>
          </div>

          {/* Delivery Channels (Telegram + Email / Gmail) */}
          <div className="mt-10 sm:mt-12">
            <div className="text-center mb-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Delivered Straight to Where You Read
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Stay updated effortlessly across your favorite communication channels
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
              {/* Telegram Channel Card */}
              <div className="group bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0088cc]">
                    <img src="/image/telegram.png" alt="Telegram" className="h-7 w-7 object-contain" />
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-sky-100 text-[#0088cc]">
                    Recommended
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#00355A] group-hover:text-blue-600 transition-colors">
                    Telegram Bot Assistant
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Receive your 7:00 AM news digests with interactive topic queries (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-[11px]">/topics</code>) directly inside your Telegram chat.
                  </p>
                </div>
                <div className="pt-1 flex items-center text-xs font-semibold text-[#0088cc] gap-1">
                  <span>Connect with @TamdanNews_bot</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Email / Gmail Channel Card */}
              <div className="group bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                    <img src="/image/gmail.png" alt="Gmail" className="h-7 w-7 object-contain" />
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Inbox Ready
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#00355A] group-hover:text-blue-600 transition-colors">
                    Gmail Newsletter Briefing
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    A clean, distraction-free morning newsletter delivered straight to your inbox with direct links to verified original articles.
                  </p>
                </div>
                <div className="pt-1 flex items-center text-xs font-semibold text-slate-700 gap-1">
                  <span>Default on your Google account</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Call To Action Banner */}
          <div className="mt-12 sm:mt-16 bg-[#00355A] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center max-w-4xl mx-auto shadow-xl space-y-4 relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                Ready to Upgrade Your Daily Reading?
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-blue-100/90 max-w-xl mx-auto leading-relaxed">
                Whether it's AI breakthroughs, global stock market movements, or local tech startups — TAMDAN ensures you never miss what's critical to your success.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#00355A] font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Start Free with TAMDAN</span>
                </button>
              </div>
            </div>
            {/* Subtle background decorative shapes */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

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
