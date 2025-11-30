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

export default function ChangeEmailPage() {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    async function handleEmailChange() {
      try {
        // Get the new email from sessionStorage
        const stored = sessionStorage.getItem("newEmail");
        if (!stored) {
          setStatusMsg("No email change request found. Redirecting to profile...");
          setStatusType("error");
          setShowBackButton(true);
          setLoading(false);
          setTimeout(() => router.replace("/profile"), 3000);
          return;
        }

        setNewEmail(stored);

        // Get the temporary session from sessionStorage (NOT localStorage)
        const tempSessionStr = sessionStorage.getItem("tempSession");
        if (!tempSessionStr) {
          setStatusMsg("No session found. Redirecting to login...");
          setStatusType("error");
          setShowBackButton(true);
          setLoading(false);
          setTimeout(() => router.replace("/"), 3000);
          return;
        }

        const session = JSON.parse(tempSessionStr);
        const idToken = session.id_token;
        if (!idToken) {
          setStatusMsg("Invalid session. Redirecting to login...");
          setStatusType("error");
          setShowBackButton(true);
          setLoading(false);
          setTimeout(() => router.replace("/"), 3000);
          return;
        }

        // Get the ORIGINAL user's current email from the current session in localStorage
        // (This is from before the email change attempt)
        const currentSessionStr = typeof window !== "undefined" ? localStorage.getItem("session") : null;
        let originalEmail = null;
        
        if (currentSessionStr) {
          try {
            const currentSession = JSON.parse(currentSessionStr);
            const currentIdToken = currentSession.id_token;
            if (currentIdToken) {
              const parts = currentIdToken.split(".");
              if (parts.length >= 2) {
                const payloadB64 = parts[1]
                  .replace(/-/g, "+")
                  .replace(/_/g, "/");
                const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
                const claims = JSON.parse(atob(padded));
                originalEmail = claims.email || null;
              }
            }
          } catch (e) {
            console.error("Failed to get original email:", e);
          }
        }

        // Use the original email for display, or fallback to decoding the new JWT
        if (!originalEmail) {
          const parts = idToken.split(".");
          if (parts.length >= 2) {
            const payloadB64 = parts[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/");
            const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
            const claims = JSON.parse(atob(padded));
            // This would be the new email, which is not what we want for comparison
            // But if we can't get the original, we use this
            originalEmail = null;
          }
        }

        setCurrentEmail(originalEmail || null);

        setLoading(false);

        // Check if new email is the same as ORIGINAL current email BEFORE making API call
        if (originalEmail && stored === originalEmail) {
          setStatusMsg("Please log in with a different Google account to change your email. You selected the same email as your current account.");
          setStatusType("error");
          setShowBackButton(true);
          // Clear the temporary session and email
          sessionStorage.removeItem("newEmail");
          sessionStorage.removeItem("tempSession");
          return;
        }

        // Auto-proceed with email change verification
        setProcessing(true);
        setStatusMsg("Verifying email and updating your account...");
        setStatusType("info");

        const res = await fetch("/api/profile/change-email", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            new_email: stored,
            original_email: originalEmail 
          }),
        });

        const json = await res.json();

        if (!json.ok) {
          // Email already exists or other error
          setStatusMsg(
            json.error || "Failed to change email. Please try again."
          );
          setStatusType("error");
          setProcessing(false);
          setShowBackButton(true);
          
          // Clear the temporary session and email on error
          sessionStorage.removeItem("newEmail");
          sessionStorage.removeItem("tempSession");
          return;
        }

        // Success! Email updated in Supabase
        // NOW save the session to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("session", tempSessionStr);
        }
        
        setStatusMsg("✓ Email updated successfully! Redirecting to profile...");
        setStatusType("success");

        // Clear the temporary email and session from sessionStorage
        sessionStorage.removeItem("newEmail");
        sessionStorage.removeItem("tempSession");
        // Redirect to profile after 2 seconds
        setTimeout(() => {
          router.replace("/profile");
        }, 2000);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setStatusMsg(`Error: ${msg}`);
        setStatusType("error");
        setLoading(false);
        setProcessing(false);
        setShowBackButton(true);
        
        // Clear temporary data on error
        sessionStorage.removeItem("newEmail");
        sessionStorage.removeItem("tempSession");
      }
    }

    handleEmailChange();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen background-color flex items-center justify-center">
        <div className="text-center">
          <div className="loader border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen background-color">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-[TamdanBold] primary-color mb-6 text-center">
          Updating Email
        </h2>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="space-y-4">
            {currentEmail && (
              <div>
                <label className="text-sm text-gray-500 block">Current Email</label>
                <p className="text-lg text-gray-900 font-medium">{currentEmail}</p>
              </div>
            )}

            {newEmail && (
              <div>
                <label className="text-sm text-gray-500 block">New Email</label>
                <p className="text-lg text-gray-900 font-medium">{newEmail}</p>
              </div>
            )}

            {statusMsg && (
              <div
                className={`p-4 rounded-md text-sm font-medium ${
                  statusType === "success"
                    ? "bg-green-100 text-green-800"
                    : statusType === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {statusMsg}
              </div>
            )}

            {processing && (
              <div className="text-center">
                <div className="loader border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 mx-auto animate-spin"></div>
                <p className="mt-4 text-gray-600">Processing...</p>
              </div>
            )}

            {showBackButton && !processing && (
              <button
                onClick={() => router.replace("/profile")}
                className="w-full px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Back to Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
