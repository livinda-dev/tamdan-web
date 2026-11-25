// src/components/TelegramConnectModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, QrCode, Smartphone, X } from "lucide-react";

interface TelegramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  botUsername?: string;
  token?: string | null;
  onSuccess?: () => void;
}

export default function TelegramConnectModal({
  isOpen,
  onClose,
  botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "TamdanNews_bot",
  token,
  onSuccess,
}: TelegramConnectModalProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "direct">("qr");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);

  const telegramLink = token
    ? `https://t.me/${botUsername}?start=${token}`
    : `https://t.me/${botUsername}`;

  // Generate QR code data URL whenever the telegramLink changes
  useEffect(() => {
    if (!isOpen || !telegramLink) return;

    let isMounted = true;
    import("qrcode")
      .then((mod) => {
        const qr = mod.default || mod;
        return qr.toDataURL(telegramLink, {
          width: 250,
          margin: 1.5,
          color: {
            dark: "#00355A", // Brand primary navy
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H", // High error correction (30%) so scanners decode instantly
        });
      })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate QR code:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, telegramLink]);

  // Real-time polling to detect when the user presses /start in Telegram
  useEffect(() => {
    if (!isOpen || connected) return;

    const interval = setInterval(async () => {
      try {
        const raw = localStorage.getItem("session");
        if (!raw) return;
        const session = JSON.parse(raw);
        const idToken = session.id_token;
        if (!idToken) return;

        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const json = await res.json();

        if (json.ok && json.user?.chat_id) {
          setConnected(true);
          clearInterval(interval);
          if (onSuccess) onSuccess();
          setTimeout(() => {
            onClose();
            setConnected(false);
          }, 1800);
        }
      } catch (e) {
        // Silent fail on poll check
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, connected, onClose, onSuccess]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(telegramLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDirect = () => {
    window.open(telegramLink, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#00355A] via-[#004e84] to-[#00355A] text-white pt-6 pb-5 px-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <svg className="w-7 h-7 fill-[#0088cc]" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold tracking-tight">Connect with Telegram</h3>
          <p className="text-xs text-blue-100 mt-1 max-w-xs mx-auto">
            Choose your preferred way to connect to <span className="font-semibold text-white">@{botUsername}</span>
          </p>
        </div>

        {/* Success Banner if connected via polling */}
        {connected ? (
          <div className="p-8 space-y-3">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Telegram Connected!</h4>
            <p className="text-xs text-slate-500">
              Your account has been linked successfully. Closing...
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setActiveTab("qr")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === "qr"
                    ? "bg-white text-[#00355A] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <QrCode className="w-4 h-4" />
                Scan QR Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("direct")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === "direct"
                    ? "bg-white text-[#00355A] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Open on Device
              </button>
            </div>

            {/* TAB 1: Scan QR Code */}
            {activeTab === "qr" && (
              <div className="space-y-4">
                <div className="relative inline-block p-3.5 bg-white border-2 border-slate-200 rounded-2xl shadow-inner">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Telegram Bot Connection QR Code"
                      className="w-52 h-52 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                      Generating QR...
                    </div>
                  )}

                  {/* Tiny Telegram Logo watermark in QR center */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 bg-white rounded-full p-1 shadow-sm border border-slate-200 flex items-center justify-center">
                      <svg className="w-5 h-5 fill-[#0088cc]" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-w-xs mx-auto">
                  <p className="text-xs font-semibold text-slate-800">
                    Scan with your phone camera or Google Lens
                  </p>
                  <div className="bg-sky-50 border border-sky-100 rounded-lg p-2 text-[11px] text-sky-800 leading-tight">
                    💡 <strong>Tip:</strong> Open your normal <strong>Phone Camera</strong> to scan. (Telegram’s in-app <em>"Link Desktop Device"</em> scanner is only for PC logins).
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Direct Open / Copy Link */}
            {activeTab === "direct" && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Click below to open the bot directly in your browser or installed Telegram desktop app.
                </p>

                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenDirect}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-[#0088cc] hover:bg-[#0077b5] text-white shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Telegram
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600">Copied to clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Telegram Invite Link
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 font-mono pt-2 break-all px-2">
                  {telegramLink}
                </p>
              </div>
            )}

            {/* Bottom Footer Tip */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Waiting for bot activation...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
