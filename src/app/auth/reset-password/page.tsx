"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [verifying, setVerifying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkRecoverySession() {
      try {
        const supabase = getSupabaseBrowserClient();

        // 1. Check for token in URL query
        const tokenHash = searchParams.get("token_hash");
        const code = searchParams.get("code");
        const type = (searchParams.get("type") || "").toLowerCase();

        if (tokenHash && type === "recovery") {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (error) {
            if (isMounted) {
              setErrorMessage(error.message);
              setVerifying(false);
            }
            return;
          }
          if (data.session?.user?.email) {
            if (isMounted) {
              setUserEmail(data.session.user.email);
              setVerifying(false);
            }
            return;
          }
        } else if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (isMounted) {
              setErrorMessage(error.message);
              setVerifying(false);
            }
            return;
          }
          if (data.session?.user?.email) {
            if (isMounted) {
              setUserEmail(data.session.user.email);
              setVerifying(false);
            }
            return;
          }
        }

        // 2. Check active Supabase session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.email) {
          if (isMounted) {
            setUserEmail(sessionData.session.user.email);
            setVerifying(false);
          }
          return;
        }

        // 3. Check hash fragment if present (e.g. #access_token=...&type=recovery)
        const hash = typeof window !== "undefined" ? window.location.hash.substring(1) : "";
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          const hashType = hashParams.get("type");
          const hashError = hashParams.get("error_description") || hashParams.get("error");

          if (hashError) {
            if (isMounted) {
              setErrorMessage(hashError);
              setVerifying(false);
            }
            return;
          }

          if (hashType === "recovery") {
            // Wait briefly for Supabase to process hash token
            const { data: delayedSession } = await supabase.auth.getSession();
            if (delayedSession?.session?.user?.email) {
              if (isMounted) {
                setUserEmail(delayedSession.session.user.email);
                setVerifying(false);
              }
              return;
            }
          }
        }

        // Listen for auth event
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === "PASSWORD_RECOVERY" || session) && session?.user?.email) {
            if (isMounted) {
              setUserEmail(session.user.email);
              setVerifying(false);
            }
          }
        });

        // Timeout fallback if no session detected after 2.5s
        setTimeout(() => {
          if (isMounted && verifying) {
            supabase.auth.getSession().then(({ data }) => {
              if (data?.session?.user?.email) {
                setUserEmail(data.session.user.email);
              } else if (!userEmail) {
                setErrorMessage(
                  "Password recovery link is missing, expired, or invalid. Please request a new recovery link."
                );
              }
              setVerifying(false);
            });
          }
        }, 2500);

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : "Error verifying link.");
          setVerifying(false);
        }
      }
    }

    checkRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [searchParams, verifying, userEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // 1. Update in Supabase Auth
      const { error: supaErr } = await supabase.auth.updateUser({
        password: password,
      });

      if (supaErr) {
        console.warn("[ResetPassword] Supabase update warning:", supaErr.message);
      }

      // 2. Update password in the Tamdan database users table and obtain session
      const targetEmail =
        userEmail ||
        (await supabase.auth.getUser()).data.user?.email ||
        localStorage.getItem("email") ||
        "";

      if (!targetEmail) {
        throw new Error("Unable to determine user email for password reset.");
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          password: password,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to update password in database.");
      }

      // 3. Store new session in localStorage
      if (json.session) {
        localStorage.setItem("session", JSON.stringify(json.session));
      }
      if (json.user) {
        const userId = json.user.id !== undefined && json.user.id !== null ? json.user.id : json.user.email;
        localStorage.setItem("userId", String(userId));
        localStorage.setItem("email", String(json.user.email || targetEmail));
        localStorage.setItem("currentEmail", String(json.user.email || targetEmail));
        localStorage.setItem("username", String(json.user.username || ""));
        localStorage.setItem("user", JSON.stringify(json.user));
      }

      setSuccess(true);

      setTimeout(() => {
        window.location.replace("/");
      }, 2500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 text-center animate-fadeIn">
          <div className="p-4 bg-[#00355A]/5 rounded-full inline-flex mb-3">
            <Loader2 className="w-10 h-10 text-[#00355A] animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#00355A]">Verifying Recovery Session</h2>
          <p className="text-gray-500 text-sm mt-1">
            Please wait while we validate your password recovery link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 sm:p-8 animate-fadeIn">
        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="p-4 bg-emerald-50 rounded-full inline-flex">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#00355A]">Password Reset Successful!</h2>
            <p className="text-gray-600 text-sm">
              Your password has been successfully updated and your account is signed in.
              Redirecting you to the home page...
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="w-full py-2.5 px-4 rounded-lg bg-[#00355A] text-white text-sm font-semibold hover:opacity-95 transition inline-flex items-center justify-center gap-2 shadow-sm"
              >
                Go to Homepage Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : errorMessage && !userEmail ? (
          <div className="text-center py-4 space-y-4">
            <div className="p-4 bg-red-50 rounded-full inline-flex">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-700">Invalid Recovery Link</h2>
            <p className="text-gray-600 text-sm">{errorMessage}</p>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/"
                className="w-full py-2.5 px-4 rounded-lg bg-[#00355A] text-white text-sm font-semibold hover:opacity-95 transition text-center"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center pb-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-[#00355A]/10 text-[#00355A] rounded-xl flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#00355A]">Reset Your Password</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {userEmail ? (
                  <>
                    Creating new password for:{" "}
                    <span className="font-semibold text-gray-700">{userEmail}</span>
                  </>
                ) : (
                  "Enter a new password for your Tamdan account"
                )}
              </p>
            </div>

            {errorMessage && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs sm:text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#00355A] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter at least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm text-[#00355A] font-medium bg-white placeholder:text-[#00355A]/40 focus:outline-none focus:ring-2 focus:ring-[#00355A] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#00355A] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm text-[#00355A] font-medium bg-white placeholder:text-[#00355A]/40 focus:outline-none focus:ring-2 focus:ring-[#00355A] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 font-medium">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 6 || password !== confirmPassword}
                className="w-full mt-2 bg-[#00355A] text-white font-semibold py-2.5 rounded-lg text-sm sm:text-base hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                  </>
                ) : (
                  "Update Password & Sign In"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-[#00355A] animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
