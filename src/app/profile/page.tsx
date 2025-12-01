"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserRow {
  id: number;
  username: string | null;
  email: string | null;
  phone: string | null;
  picture: string | null;
  created_at?: string;
  chat_id?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserRow | null>(null);
  const [editUsername, setEditUsername] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangeEmailPrompt, setShowChangeEmailPrompt] = useState(false);
  const [updatingBot, setUpdatingBot] = useState(false);
  const [currentIdToken, setCurrentIdToken] = useState<string | null>(null);
  const [changingEmail, setChangingEmail] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const raw = localStorage.getItem("session");
      if (!raw) {
        router.replace("/");
        return;
      }

      const session = JSON.parse(raw);
      const idToken = session.id_token;
      setCurrentIdToken(idToken);
      if (!idToken) {
        router.replace("/");
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const json = await res.json();

        if (!json.ok) {
          router.replace("/");
          return;
        }

        setUser(json.user);
        setEditUsername(json.user?.username ?? "");
      } catch (err) {
        console.error("Profile fetch failed", err);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleChangeEmail = () => {
    setShowChangeEmailPrompt(true);
  };

  const handleConfirmChangeEmail = () => {
    setShowChangeEmailPrompt(false);
    setChangingEmail(true);
    localStorage.setItem("currentEmail", user?.email || "");
    localStorage.setItem("currentIdToken", currentIdToken || "");
    // Redirect to Google OAuth with email change flag
    window.location.href = "/api/auth/google?emailChange=true";
  };

  const handleCancelChangeEmail = () => {
    setShowChangeEmailPrompt(false);
  };

  const handleBot = async () => {
    if (!user) return;
    if (user.chat_id != null) {
      setUpdatingBot(true);
      try {
        const raw = localStorage.getItem("session");
        if (!raw) throw new Error("No session");
        const session = JSON.parse(raw);
        const idToken = session.id_token;
        if (!idToken) throw new Error("No id token");
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chat_id: null }),
        });
        const json = await res.json();
        if (json.ok) {
          setUser(json.user);
        } else {
          throw new Error(json.error || "Ulinking bot failed");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown";
        setStatusMsg(`Error: ${msg}`);
      } finally {
        setUpdatingBot(false);
      }
    } else{
      try {
      const sessionRaw = localStorage.getItem("session");
      if (!sessionRaw) {
        alert("Session expired. Please log in again.");
        return;
      }

      const parsed = JSON.parse(sessionRaw) as { id_token?: string };
      const idToken = parsed.id_token;

      if (!idToken) {
        alert("Session expired. Please log in again.");
        return;
      }

      // Generate a one-time token for Telegram linking
      const res = await fetch("/api/bots/generate-telegram-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const json = await res.json();

      if (json.ok && json.token) {
        // Use correct Telegram URL format (works on web and mobile)
        window.open(`https://t.me/tamdanNewsBot?start=${json.token}`, '_blank');
      } else {
        alert("Failed to generate connection link. Please try again.");
      }
    } catch (error) {
      console.error("Telegram connect error:", error);
      alert("Failed to connect. Please try again.");
    }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.2s]"></div>
          <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.4s]"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
          Loading your profile...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen background-color px-4 sm:px-6 md:px-8">
      <div className="max-w-2xl mx-auto py-6 sm:py-8 md:py-12">
        <h2 className="text-2xl sm:text-3xl font-[TamdanBold] primary-color mb-6 sm:mb-8 text-center">
          Profile Information
        </h2>

        <div className="bg-white shadow-lg p-6 sm:p-8 space-y-6">
          {/* Username Section */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-2">
              Username
            </label>
            <textarea
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 py-2 text-base sm:text-lg text-gray-900 resize-none px-0"
              value={editUsername}
              onChange={(e) => {
                setStatusMsg(null);
                setEditUsername(e.target.value);
              }}
              rows={1}
            />

            {editUsername !== (user.username ?? "") && (
              <div className="mt-3">
                <button
                  className="px-4 py-2 rounded-md text-white text-sm sm:text-base bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  onClick={async () => {
                    setSaving(true);
                    setStatusMsg(null);
                    try {
                      const raw = localStorage.getItem("session");
                      if (!raw) throw new Error("No session");
                      const session = JSON.parse(raw);
                      const idToken = session.id_token;
                      if (!idToken) throw new Error("No id token");

                      const res = await fetch("/api/profile", {
                        method: "PATCH",
                        headers: {
                          Authorization: `Bearer ${idToken}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username: editUsername }),
                      });

                      const json = await res.json();
                      if (!json.ok) {
                        throw new Error(json.error || "Update failed");
                      }

                      setUser(
                        json.user ??
                          ({ ...user, username: editUsername } as UserRow)
                      );
                      setStatusMsg("Saved");
                    } catch (err: unknown) {
                      const msg =
                        err instanceof Error ? err.message : "Unknown";
                      setStatusMsg(`Error: ${msg}`);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}

            {statusMsg && (
              <p className="mt-2 text-xs sm:text-sm text-gray-600">
                {statusMsg}
              </p>
            )}
          </div>

          {/* Email Section */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-2">
              Email
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <p className="text-base sm:text-lg text-gray-900">
                {user.email ?? "—"}
              </p>
              <button
                onClick={handleChangeEmail}
                disabled={changingEmail}
                className="px-4 py-2  text-sm text-white bg-primary-color hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {changingEmail ? "Changing..." : "Change Email"}
              </button>
            </div>
          </div>
          {/* Telegram bots section */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-2">
              Telegram bot
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <p className="text-base sm:text-lg text-gray-900">
                {user.chat_id ? "Linked" : "Not linked"}
              </p>
              <button
                onClick={handleBot}
                disabled={updatingBot}
                className="px-4 py-2  text-sm text-white bg-primary-color hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {user.chat_id
                  ? updatingBot
                    ? "Unlinking..."
                    : "Unlink Bot"
                  : "Link Bot"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Email Confirmation Modal */}
      {showChangeEmailPrompt && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4"
          onClick={handleCancelChangeEmail}
        >
          <div
            className="bg-white shadow-xl px-6 sm:px-8 py-6 sm:py-8 text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Change Email
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-6 leading-relaxed">
              To change your email, you need to log in via Google again. We will
              verify that the new email does not already exist in our system
              before updating your account.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCancelChangeEmail}
                className="flex-1 px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChangeEmail}
                disabled={changingEmail}
                className="flex-1 px-4 py-2 rounded-md text-white bg-primary-color hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {changingEmail ? "Signing in..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
function setChangingEmail(arg0: boolean) {
  throw new Error("Function not implemented.");
}
