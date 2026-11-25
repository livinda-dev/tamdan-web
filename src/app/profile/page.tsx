"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidEmailFormat } from "@/lib/auth";
import Alert from "@/components/alert";
import TelegramConnectModal from "@/components/TelegramConnectModal";

interface UserRow {
  id: number;
  username: string | null;
  email: string | null;
  phone_number: string | null;
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

  // Email modal state
  const [showChangeEmailPrompt, setShowChangeEmailPrompt] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailModalError, setEmailModalError] = useState<string | null>(null);
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // Telegram connection modal state
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramModalToken, setTelegramModalToken] = useState<string | null>(null);

  // Phone modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneModalError, setPhoneModalError] = useState<string | null>(null);
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const [connectTelegramAfterPhone, setConnectTelegramAfterPhone] = useState(false);

  // Bot state
  const [updatingBot, setUpdatingBot] = useState(false);
  const [currentIdToken, setCurrentIdToken] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    text: string;
    status: "error" | "success" | "info" | "warning";
  } | null>(null);

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
        if (json.user?.phone_number) {
          localStorage.setItem("phone_number", json.user.phone_number);
        }
      } catch (err) {
        console.error("Profile fetch failed", err);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleChangeEmailClick = () => {
    setNewEmailInput("");
    setEmailModalError(null);
    setShowChangeEmailPrompt(true);
  };

  const handleOpenPhoneModal = (forTelegram = false) => {
    setPhoneInput(user?.phone_number || "");
    setPhoneModalError(null);
    setConnectTelegramAfterPhone(forTelegram);
    setShowPhoneModal(true);
  };

  const handleConfirmChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailModalError(null);

    const trimmed = newEmailInput.trim().toLowerCase();
    if (!trimmed) {
      setEmailModalError("Please enter a new email address.");
      return;
    }

    if (!isValidEmailFormat(trimmed)) {
      setEmailModalError("Please enter a valid email format (e.g. user@example.com).");
      return;
    }

    if (trimmed === user?.email?.toLowerCase()) {
      setEmailModalError("New email is identical to your current email.");
      return;
    }

    setUpdatingEmail(true);

    try {
      const raw = localStorage.getItem("session");
      if (!raw) throw new Error("Session expired. Please log in again.");
      const session = JSON.parse(raw);
      const idToken = session.id_token;

      const res = await fetch("/api/profile/change-email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_email: trimmed,
          original_email: user?.email,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setEmailModalError(json.error || "Failed to update email.");
        return;
      }

      setUser((prev) => (prev ? { ...prev, email: trimmed } : null));
      setStatusMsg("Email updated successfully.");
      setShowChangeEmailPrompt(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error updating email";
      setEmailModalError(msg);
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleConfirmChangePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneModalError(null);

    const trimmed = phoneInput.trim().replace(/\s+/g, "");
    if (!trimmed) {
      setPhoneModalError("Please enter a valid phone number.");
      return;
    }

    if (trimmed.length < 8 || trimmed.length > 16) {
      setPhoneModalError("Phone number must be between 8 and 16 digits.");
      return;
    }

    setUpdatingPhone(true);

    try {
      const raw = localStorage.getItem("session");
      if (!raw) throw new Error("Session expired. Please log in again.");
      const session = JSON.parse(raw);
      const idToken = session.id_token;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: trimmed,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setPhoneModalError(json.error || "Failed to update phone number.");
        return;
      }

      setUser((prev) => (prev ? { ...prev, phone_number: trimmed } : null));
      localStorage.setItem("phone_number", trimmed);
      setShowPhoneModal(false);

      if (connectTelegramAfterPhone) {
        setConnectTelegramAfterPhone(false);
        // Automatically proceed to connect Telegram
        await initiateTelegramConnection(trimmed);
      } else {
        setAlertConfig({
          text: "Phone number updated successfully.",
          status: "success",
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error updating phone number";
      setPhoneModalError(msg);
    } finally {
      setUpdatingPhone(false);
    }
  };

  const initiateTelegramConnection = async (explicitPhone?: string) => {
    const raw = localStorage.getItem("session");
    if (!raw) {
      setAlertConfig({
        text: "Session expired. Please log in again.",
        status: "warning",
      });
      return;
    }
    const session = JSON.parse(raw);
    const idToken = session.id_token;

    setUpdatingBot(true);
    try {
      const res = await fetch("/api/bots/generate-telegram-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          phone_number: explicitPhone || user?.phone_number,
        }),
      });

      const json = await res.json();

      if (json.ok && json.token) {
        setTelegramModalToken(json.token);
        setIsTelegramModalOpen(true);
      } else {
        setAlertConfig({
          text: json.error || "Failed to generate connection link. Please try again.",
          status: "error",
        });
      }
    } catch (error) {
      console.error("Telegram connect error:", error);
      setAlertConfig({
        text: "Failed to connect to Telegram. Please try again.",
        status: "error",
      });
    } finally {
      setUpdatingBot(false);
    }
  };

  const reloadProfile = async () => {
    const raw = localStorage.getItem("session");
    if (!raw) return;
    try {
      const session = JSON.parse(raw);
      if (!session.id_token) return;
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.id_token}` },
      });
      const json = await res.json();
      if (json.ok && json.user) {
        setUser(json.user);
      }
    } catch (e) {
      console.error("Failed to reload profile", e);
    }
  };

  const handleBot = async () => {
    if (!user) return;

    if (!user.phone_number) {
      handleOpenPhoneModal(true);
      return;
    }

    await initiateTelegramConnection();
  };

  const handleUnlinkBot = async () => {
    if (!user) return;
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
        setUser((prev) => (prev ? { ...prev, chat_id: null } : null));
        setAlertConfig({
          text: "Telegram bot unlinked successfully.",
          status: "success",
        });
      } else {
        throw new Error(json.error || "Unlinking bot failed");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown";
      setAlertConfig({
        text: `Error unlinking bot: ${msg}`,
        status: "error",
      });
    } finally {
      setUpdatingBot(false);
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
                  className="px-4 py-2 rounded-md text-white text-sm sm:text-base bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
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
              <p className="text-base sm:text-lg text-gray-900 font-medium">
                {user.email ?? "—"}
              </p>
              <button
                onClick={handleChangeEmailClick}
                className="px-4 py-2 text-sm text-white bg-primary-color hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap cursor-pointer rounded"
              >
                Change Email
              </button>
            </div>
          </div>

          {/* Phone Number Section */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-2">
              Phone Number
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                {user.phone_number ? (
                  <p className="text-base sm:text-lg text-gray-900 font-medium tracking-wide">
                    {user.phone_number}
                  </p>
                ) : (
                  <p className="text-base sm:text-lg text-gray-400 italic">
                    Not set
                  </p>
                )}
              </div>
              <button
                onClick={() => handleOpenPhoneModal(false)}
                className="px-4 py-2 text-sm text-white bg-primary-color hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap cursor-pointer rounded"
              >
                {user.phone_number ? "Change Phone" : "Add Phone"}
              </button>
            </div>
          </div>

          {/* Telegram bot section */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-2">
              Telegram bot
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                {user.chat_id ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      ● Connected
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      (Chat ID: {user.chat_id})
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    Not linked
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {user.chat_id ? (
                  <>
                    <button
                      onClick={() => initiateTelegramConnection()}
                      disabled={updatingBot}
                      className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap cursor-pointer rounded"
                      title="Reconnect or switch Telegram account"
                    >
                      {updatingBot ? "Connecting..." : "Reconnect"}
                    </button>
                    <button
                      onClick={handleUnlinkBot}
                      disabled={updatingBot}
                      className="px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-50 whitespace-nowrap cursor-pointer rounded"
                    >
                      {updatingBot ? "Unlinking..." : "Unlink Bot"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBot}
                    disabled={updatingBot}
                    className="px-4 py-2 text-sm text-white bg-primary-color hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap cursor-pointer rounded"
                  >
                    {updatingBot ? "Connecting..." : "Link Bot"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Phone Modal */}
      {showPhoneModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4"
          onClick={() => {
            setShowPhoneModal(false);
            setConnectTelegramAfterPhone(false);
          }}
        >
          <div
            className="bg-white shadow-xl rounded-xl px-6 sm:px-8 py-6 sm:py-8 text-left max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {user.phone_number ? "Change Phone Number" : "Add Phone Number"}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">
              {connectTelegramAfterPhone
                ? "Please enter your phone number to link with the Telegram bot."
                : "Enter your phone number for news updates and bot linking."}
            </p>

            <form onSubmit={handleConfirmChangePhone} className="space-y-4">
              {phoneModalError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs sm:text-sm text-red-700">
                  {phoneModalError}
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 012345678"
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    setPhoneModalError(null);
                  }}
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPhoneModal(false);
                    setConnectTelegramAfterPhone(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPhone}
                  className="flex-1 px-4 py-2 rounded-md text-white bg-primary-color hover:bg-blue-700 disabled:opacity-50 text-sm cursor-pointer"
                >
                  {updatingPhone
                    ? "Saving..."
                    : connectTelegramAfterPhone
                    ? "Save & Connect"
                    : "Save Phone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showChangeEmailPrompt && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4"
          onClick={() => setShowChangeEmailPrompt(false)}
        >
          <div
            className="bg-white shadow-xl rounded-xl px-6 sm:px-8 py-6 sm:py-8 text-left max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Change Email Address
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">
              Enter your new email address. It must be in a valid format.
            </p>

            <form onSubmit={handleConfirmChangeEmail} className="space-y-4">
              {emailModalError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs sm:text-sm text-red-700">
                  {emailModalError}
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  New Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. newuser@example.com"
                  value={newEmailInput}
                  onChange={(e) => {
                    setNewEmailInput(e.target.value);
                    setEmailModalError(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangeEmailPrompt(false)}
                  className="flex-1 px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingEmail}
                  className="flex-1 px-4 py-2 rounded-md text-white bg-primary-color hover:bg-blue-700 disabled:opacity-50 text-sm cursor-pointer"
                >
                  {updatingEmail ? "Updating..." : "Update Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Styled In-App Alert Box */}
      <Alert
        isOpen={!!alertConfig}
        text={alertConfig?.text || ""}
        status={alertConfig?.status || "info"}
        onClose={() => setAlertConfig(null)}
      />

      {/* Telegram Connection Modal (QR Code & Direct Link) */}
      <TelegramConnectModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        token={telegramModalToken}
        onSuccess={reloadProfile}
      />
    </main>
  );
}
