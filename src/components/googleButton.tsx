"use client";
import React, { useState, useEffect } from "react";
import { isValidEmailFormat } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Mail, ArrowLeft, CheckCircle2, Sparkles, KeyRound, ShieldAlert } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialError?: string | null;
}

type AuthMode = "signin" | "signup" | "forgot_password" | "magic_link" | "verification_sent";

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialError }) => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (initialError) {
      setGeneralError(initialError);
    }
  }, [initialError]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading && !googleLoading) {
      handleClose();
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setPhone_number("");
    setEmailError(null);
    setGeneralError(null);
    setSuccessMessage(null);
    setResendStatus(null);
    setMode("signin");
    setLoading(false);
    setGoogleLoading(false);
    onClose();
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    setGeneralError(null);
    window.location.href = "/api/auth/google";
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setGeneralError(null);
    setSuccessMessage(null);
    if (val.trim() && !isValidEmailFormat(val.trim())) {
      setEmailError("Invalid email format (e.g. user@example.com)");
    } else {
      setEmailError(null);
    }
  };

  const handleResetPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }
    if (!isValidEmailFormat(trimmedEmail)) {
      setEmailError("Please enter a valid email format.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${origin}/auth/reset-password`,
      });

      if (error) {
        setGeneralError(error.message);
        return;
      }

      setSuccessMessage(
        "A password recovery email has been sent. Please check your inbox to reset your password."
      );
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : "Failed to send recovery email.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }
    if (!isValidEmailFormat(trimmedEmail)) {
      setEmailError("Please enter a valid email format.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setGeneralError(error.message);
        return;
      }

      setSuccessMessage(
        "A magic sign-in link has been sent to your email. Click the link in the email to log in instantly!"
      );
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResendLoading(true);
    setResendStatus(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResendStatus({
          ok: true,
          msg: data.message || "Verification email resent! Please check your inbox and Spam folder.",
        });
      } else {
        setResendStatus({
          ok: false,
          msg: data.error || "Failed to resend confirmation email.",
        });
      }
    } catch {
      setResendStatus({
        ok: false,
        msg: "Network error trying to resend email. Please try again.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setEmailError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }

    if (!isValidEmailFormat(trimmedEmail)) {
      setEmailError("Please enter a valid email format (e.g. user@example.com).");
      return;
    }

    if (mode === "signup" && !phone_number.trim()) {
      setGeneralError("Phone number is required.");
      return;
    }

    if (!password) {
      setGeneralError("Password is required.");
      return;
    }

    if (mode === "signup" && !username.trim()) {
      setGeneralError("Username is required.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/signup";
      const payload =
        mode === "signin"
          ? { email: trimmedEmail, password }
          : { username: username.trim(), email: trimmedEmail, password, phone_number: phone_number.trim() };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setGeneralError(json.error || "Authentication failed. Please try again.");
        return;
      }

      // If registration requires email confirmation
      if (mode === "signup" && json.requires_verification) {
        setMode("verification_sent");
        return;
      }

      // Sign In success
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

      handleClose();
      window.location.reload();
    } catch (err) {
      console.error("Auth error:", err);
      setGeneralError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all transform duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-6 sm:pt-7 px-6 sm:px-8 pb-4 text-center border-b border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-serif text-[#00355A] font-bold">
            {mode === "forgot_password"
              ? "Reset Password"
              : mode === "magic_link"
              ? "Send Magic Link"
              : mode === "verification_sent"
              ? "Verify Your Email"
              : "Welcome to តាមដាន Tamdan"}
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {mode === "forgot_password"
              ? "Send a password recovery email to your inbox"
              : mode === "magic_link"
              ? "Send a passwordless magic link to your email"
              : mode === "verification_sent"
              ? "Please confirm your email address to continue"
              : "Personalized daily news digest and updates"}
          </p>
        </div>

        {/* Verification Sent Screen */}
        {mode === "verification_sent" ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto text-[#00355A]">
              <Mail className="w-8 h-8 text-[#00355A]" />
            </div>
            <h3 className="text-xl font-bold text-[#00355A]">Check Your Inbox!</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We sent an email verification link to <strong className="text-[#00355A]">{email}</strong>.
            </p>
            <div className="text-xs text-gray-600 leading-relaxed bg-amber-50/70 p-3 rounded-lg border border-amber-200/80 text-left space-y-1">
              <p className="font-semibold text-amber-900">Didn&apos;t see the email?</p>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                <li>Check your <strong>Spam</strong> or <strong>Junk</strong> folder.</li>
                <li>Wait 1–2 minutes for delivery.</li>
                <li>Or click below to resend.</li>
              </ul>
            </div>

            {resendStatus && (
              <div
                className={`p-3 rounded-lg text-xs text-left ${
                  resendStatus.ok
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {resendStatus.msg}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full bg-white border border-gray-300 text-[#00355A] font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
              >
                {resendLoading ? "Resending..." : "Resend Verification Email"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setGeneralError(null);
                  setSuccessMessage(null);
                  setResendStatus(null);
                }}
                className="w-full bg-[#00355A] text-white font-semibold py-2.5 rounded-lg text-sm hover:opacity-95 transition cursor-pointer"
              >
                Proceed to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Google Authentication (available for signin/signup) */}
            {(mode === "signin" || mode === "signup") && (
              <div className="pt-5 px-6 sm:px-8">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition active:scale-[0.99] disabled:opacity-60 cursor-pointer text-sm"
                >
                  {googleLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-gray-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Redirecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-3 text-xs text-gray-400 font-medium uppercase">
                    or with email
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
              </div>
            )}

            {/* Tab Switcher (only for signin/signup) */}
            {(mode === "signin" || mode === "signup") && (
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                  type="button"
                  className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                    mode === "signin"
                      ? "bg-white text-[#00355A] border-b-2 border-[#00355A]"
                      : "text-gray-500 hover:text-[#00355A]"
                  }`}
                  onClick={() => {
                    setMode("signin");
                    setGeneralError(null);
                    setEmailError(null);
                    setSuccessMessage(null);
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                    mode === "signup"
                      ? "bg-white text-[#00355A] border-b-2 border-[#00355A]"
                      : "text-gray-500 hover:text-[#00355A]"
                  }`}
                  onClick={() => {
                    setMode("signup");
                    setGeneralError(null);
                    setEmailError(null);
                    setSuccessMessage(null);
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Reset Password Form */}
            {mode === "forgot_password" && (
              <form onSubmit={handleResetPasswordRequest} className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setGeneralError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-[#00355A] flex items-center gap-1 hover:underline font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </div>

                {generalError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs sm:text-sm text-red-700">
                    {generalError}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-xs sm:text-sm text-green-700 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#00355A] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. user@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm text-[#00355A] font-medium bg-white placeholder:text-[#00355A]/40 focus:outline-none focus:ring-2 transition ${
                      emailError
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-[#00355A] focus:border-transparent"
                    }`}
                  />
                  {emailError && <p className="mt-1 text-xs text-red-600 font-medium">{emailError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#00355A] text-white font-semibold py-2.5 rounded-lg text-sm hover:opacity-95 transition disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Password Reset Link"}
                </button>
              </form>
            )}

            {/* Magic Link Form */}
            {mode === "magic_link" && (
              <form onSubmit={handleMagicLinkRequest} className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setGeneralError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-[#00355A] flex items-center gap-1 hover:underline font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </div>

                {generalError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs sm:text-sm text-red-700">
                    {generalError}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-xs sm:text-sm text-green-700 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#00355A] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. user@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm text-[#00355A] font-medium bg-white placeholder:text-[#00355A]/40 focus:outline-none focus:ring-2 transition ${
                      emailError
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-[#00355A] focus:border-transparent"
                    }`}
                  />
                  {emailError && <p className="mt-1 text-xs text-red-600 font-medium">{emailError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#00355A] text-white font-semibold py-2.5 rounded-lg text-sm hover:opacity-95 transition disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
            )}

            {/* Standard Sign In & Sign Up Form */}
            {(mode === "signin" || mode === "signup") && (
              <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 space-y-4">
                {generalError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs sm:text-sm text-red-700 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{generalError}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-xs sm:text-sm text-green-700 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {mode === "signup" && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#00355A] mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setGeneralError(null);
                        }}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-[#00355A] font-medium bg-white placeholder:text-[#00355A]/40 focus:outline-none focus:ring-2 focus:ring-[#00355A] focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#00355A] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your phone number"
                        value={phone_number}
                        onChange={(e) => {
                          setPhone_number(e.target.value);
                          setGeneralError(null);
                        }}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-[#00355A] font-medium bg-white placeholder:text-[#00355A]/40 focus:outline-none focus:ring-2 focus:ring-[#00355A] focus:border-transparent transition"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#00355A] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. user@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm text-[#00355A] font-medium bg-white placeholder:text-[#00355A]/40 focus:outline-none focus:ring-2 transition ${
                      emailError
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-[#00355A] focus:border-transparent"
                    }`}
                  />
                  {emailError && <p className="mt-1 text-xs text-red-600 font-medium">{emailError}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs sm:text-sm font-semibold text-[#00355A]">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot_password");
                          setGeneralError(null);
                          setEmailError(null);
                          setSuccessMessage(null);
                        }}
                        className="text-xs text-[#00355A] hover:underline font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setGeneralError(null);
                    }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-[#00355A] font-medium bg-white placeholder:text-[#00355A]/40 focus:outline-none focus:ring-2 focus:ring-[#00355A] focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#00355A] text-white font-semibold py-2.5 rounded-lg text-sm sm:text-base hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {loading
                    ? "Processing..."
                    : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
                </button>

                {mode === "signup" && (
                  <p className="text-center text-[11px] text-gray-500 leading-tight pt-1">
                    A confirmation link will be sent to your email to verify your address.
                  </p>
                )}

                {/* Quick option to sign in with magic link */}
                {mode === "signin" && (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("magic_link");
                        setGeneralError(null);
                        setEmailError(null);
                        setSuccessMessage(null);
                      }}
                      className="w-full py-2 px-3 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#00355A] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#00355A]" />
                      Sign in with Magic Link
                    </button>
                  </div>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
