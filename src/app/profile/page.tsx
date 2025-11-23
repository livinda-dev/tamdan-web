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
}

interface GoogleClaims {
  email?: string;
  sub?: string;
  name?: string;
}

// Helper to decode JWT
function decodeJwtPayload<T = unknown>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payloadB64 = parts[1]
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    // For client-side, use TextEncoder/atob instead of Buffer
    const json = atob(padded);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserRow | null>(null);
  const [editUsername, setEditUsername] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangeEmailPrompt, setShowChangeEmailPrompt] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [currentIdToken, setCurrentIdToken] = useState<string | null>(null);

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
    localStorage.setItem("currentIdToken",currentIdToken || "");
    // Redirect to Google OAuth with email change flag
    window.location.href = "/api/auth/google?emailChange=true";
  };

  const handleCancelChangeEmail = () => {
    setShowChangeEmailPrompt(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen background-color flex items-center justify-center">
        <div className="text-center">
          <div className="loader border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen background-color">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-[TamdanBold] primary-color mb-6 text-center">
          Profile Information
        </h2>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div>
            <label className="text-sm text-gray-500 block">Username</label>
            <textarea
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 py-1 text-lg text-gray-900 resize-none"
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
                  className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50`}
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

                      setUser(json.user ?? { ...user, username: editUsername } as UserRow);
                      setStatusMsg("Saved");
                    } catch (err: unknown) {
                      const msg = err instanceof Error ? err.message : "Unknown";
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

            {statusMsg && <p className="mt-2 text-sm text-gray-600">{statusMsg}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-500 block">Email</label>
            <div className="flex items-center justify-between">
              <p className="text-lg text-gray-900">{user.email ?? "—"}</p>
              <button
                onClick={handleChangeEmail}
                disabled={changingEmail}
                className="ml-4 px-3 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {changingEmail ? "Changing..." : "Change Email"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Email Confirmation Modal */}
      {showChangeEmailPrompt && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          onClick={handleCancelChangeEmail}
        >
          <div
            className="bg-white rounded-lg shadow-xl px-8 py-8 text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Change Email
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              To change your email, you need to log in via Google again. We will verify that the new email doesn't already exist in our system before updating your account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelChangeEmail}
                className="flex-1 px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChangeEmail}
                disabled={changingEmail}
                className="flex-1 px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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
