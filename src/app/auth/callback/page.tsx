"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Authenticating, please wait...");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        const supabase = getSupabaseBrowserClient();

        // 1. Check for error parameters in URL query or hash
        const queryError = searchParams.get("error_description") || searchParams.get("error");
        if (queryError) {
          if (isMounted) {
            setStatus("error");
            setMessage(queryError);
          }
          return;
        }

        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const type = (searchParams.get("type") || "").toLowerCase();

        // Check if hash has access_token or type
        const hash = typeof window !== "undefined" ? window.location.hash.substring(1) : "";
        const hashParams = new URLSearchParams(hash);
        const hashType = (hashParams.get("type") || "").toLowerCase();
        const hashError = hashParams.get("error_description") || hashParams.get("error");

        if (hashError) {
          if (isMounted) {
            setStatus("error");
            setMessage(hashError);
          }
          return;
        }

        const effectiveType = type || hashType;

        // If this is password recovery
        if (effectiveType === "recovery") {
          setIsRecovery(true);
          if (tokenHash) {
            const { error: verifyErr } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: "recovery",
            });
            if (verifyErr) {
              if (isMounted) {
                setStatus("error");
                setMessage(verifyErr.message);
              }
              return;
            }
          } else if (code) {
            const { error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (codeErr) {
              if (isMounted) {
                setStatus("error");
                setMessage(codeErr.message);
              }
              return;
            }
          }
          // Redirect to reset password page preserving hash if any
          if (isMounted) {
            setStatus("success");
            setMessage("Recovery link verified. Redirecting to reset password...");
            setTimeout(() => {
              router.replace(`/auth/reset-password${window.location.hash}`);
            }, 600);
          }
          return;
        }

        // Handle Magic Link (or normal code exchange)
        if (tokenHash && effectiveType === "magiclink") {
          const { error: otpErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "magiclink",
          });
          if (otpErr) {
            if (isMounted) {
              setStatus("error");
              setMessage(otpErr.message);
            }
            return;
          }
        } else if (code) {
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchErr) {
            if (isMounted) {
              setStatus("error");
              setMessage(exchErr.message);
            }
            return;
          }
        }

        // Get the Supabase session/user
        const { data: sessionData, error: sessErr } = await supabase.auth.getSession();
        if (sessErr || !sessionData?.session?.user?.email) {
          // If no session found yet, wait for onAuthStateChange
          const { data: authSub } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "PASSWORD_RECOVERY") {
              if (isMounted) {
                setIsRecovery(true);
                router.replace(`/auth/reset-password${window.location.hash}`);
              }
            } else if (session?.user?.email) {
              await completeMagicLogin(session.user.email, session.user.user_metadata?.username);
              authSub.subscription.unsubscribe();
            }
          });
          return;
        }

        const userEmail = sessionData.session.user.email;
        const metaUsername = sessionData.session.user.user_metadata?.username;
        await completeMagicLogin(userEmail, metaUsername);
      } catch (err: unknown) {
        if (isMounted) {
          setStatus("error");
          setMessage(err instanceof Error ? err.message : "Authentication error occurred.");
        }
      }
    }

    async function completeMagicLogin(email: string, username?: string) {
      try {
        const res = await fetch("/api/auth/magic-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username }),
        });
        const json = await res.json();

        if (!res.ok || !json.ok) {
          if (isMounted) {
            setStatus("error");
            setMessage(json.error || "Failed to finalize magic link sign-in.");
          }
          return;
        }

        // Store session tokens into localStorage
        if (json.session) {
          localStorage.setItem("session", JSON.stringify(json.session));
        }
        if (json.user) {
          const userId = json.user.id !== undefined && json.user.id !== null ? json.user.id : json.user.email;
          localStorage.setItem("userId", String(userId));
          localStorage.setItem("email", String(json.user.email || ""));
          localStorage.setItem("currentEmail", String(json.user.email || ""));
          localStorage.setItem("username", String(json.user.username || ""));
          localStorage.setItem("user", JSON.stringify(json.user));
        }

        if (isMounted) {
          setStatus("success");
          setMessage("Signed in successfully via Magic Link! Redirecting...");
          setTimeout(() => {
            window.location.replace("/");
          }, 1000);
        }
      } catch (e: unknown) {
        if (isMounted) {
          setStatus("error");
          setMessage(e instanceof Error ? e.message : "Login completion failed.");
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 text-center animate-fadeIn">
        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-[#00355A]/5 rounded-full">
              <Loader2 className="w-10 h-10 text-[#00355A] animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-[#00355A]">
              {isRecovery ? "Verifying recovery link..." : "Signing you in..."}
            </h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-emerald-50 rounded-full">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-[#00355A]">Success!</h2>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-red-50 rounded-full">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-700">Authentication Failed</h2>
            <p className="text-gray-600 text-sm">{message}</p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/"
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#00355A] text-white text-sm font-semibold hover:opacity-95 transition text-center inline-flex items-center justify-center gap-1.5"
              >
                Go to Homepage <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-[#00355A] animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
