"use client";
import React, { useState } from "react";
import { isValidEmailFormat } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Mail, ArrowLeft, CheckCircle2, Sparkles, KeyRound } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup" | "forgot_password" | "magic_link";

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
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
    setMode("signin");
    onClose();
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
        <div className="pt-6 sm:pt-8 px-6 sm:px-8 pb-4 text-center border-b border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-serif text-[#00355A] font-bold">
            {mode === "forgot_password"
              ? "Reset Password"
              : mode === "magic_link"
              ? "Send Magic Link"
              : "Welcome to តាមដាន Tamdan"}
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {mode === "forgot_password"
              ? "Send a password recovery email to the user"
              : mode === "magic_link"
              ? "Send a passwordless magic link to the user"
              : "Personalized daily news digest and updates"}
          </p>
        </div>

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

        {/* Forgot Password View */}
        {mode === "forgot_password" && (
          <form onSubmit={handleResetPasswordRequest} className="p-6 sm:p-8 space-y-4">
            {generalError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs sm:text-sm text-red-700">
                {generalError}
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-xs sm:text-sm text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#00355A] mb-1">
                Account Email
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
              className="w-full mt-2 bg-[#00355A] text-white font-semibold py-2.5 rounded-lg text-sm sm:text-base hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {loading ? "Sending..." : "Send password recovery"}
            </button>

            <div className="pt-2 text-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setGeneralError(null);
                  setEmailError(null);
                  setSuccessMessage(null);
                }}
                className="text-gray-500 hover:text-[#00355A] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Magic Link View */}
        {mode === "magic_link" && (
          <form onSubmit={handleMagicLinkRequest} className="p-6 sm:p-8 space-y-4">
            {generalError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs sm:text-sm text-red-700">
                {generalError}
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-xs sm:text-sm text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
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
              className="w-full mt-2 bg-[#00355A] text-white font-semibold py-2.5 rounded-lg text-sm sm:text-base hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {loading ? "Sending..." : "Send magic link"}
            </button>

            <div className="pt-2 text-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setGeneralError(null);
                  setEmailError(null);
                  setSuccessMessage(null);
                }}
                className="text-gray-500 hover:text-[#00355A] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Regular Sign In / Sign Up Form */}
        {(mode === "signin" || mode === "signup") && (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {generalError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs sm:text-sm text-red-700">
                {generalError}
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

            <div className="pt-2 text-center text-xs text-gray-500">
              {mode === "signin" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setGeneralError(null);
                      setEmailError(null);
                    }}
                    className="text-[#00355A] font-bold hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setGeneralError(null);
                      setEmailError(null);
                    }}
                    className="text-[#00355A] font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
