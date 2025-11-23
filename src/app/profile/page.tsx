"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function decodeJwtPayload<T = unknown>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(escape(window.atob(padded)))
        : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

interface User {
  id: string;
  username: string;
  email: string | null;
  picture?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        router.replace("/");
        return;
      }

      const session = JSON.parse(raw) as { id_token?: string };
      if (!session?.id_token) {
        router.replace("/");
        return;
      }

      const claims = decodeJwtPayload<{
        sub: string;
        email?: string;
        name?: string;
        given_name?: string;
        family_name?: string;
        picture?: string;
      }>(session.id_token);

      if (!claims) {
        router.replace("/");
        return;
      }

      const username =
        claims.name ||
        [claims.given_name, claims.family_name].filter(Boolean).join(" ") ||
        "Google User";

      setUser({
        id: claims.sub,
        username,
        email: claims.email ?? null,
        picture: claims.picture,
      });
    } catch (e) {
      console.error("Failed to read session from localStorage", e);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

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
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Username
              </label>
              <p className="text-lg text-gray-900">{user.username}</p>
            </div>

            <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email Address
              </label>
              <p className="text-lg text-gray-900">{user.email ?? "—"}</p>
            </div>

            <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                User ID
              </label>
              <p className="text-sm text-gray-600 font-mono">{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
