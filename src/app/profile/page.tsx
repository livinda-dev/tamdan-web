"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function decodeJwtPayload<T = any>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    const json = typeof window !== "undefined"
      ? decodeURIComponent(escape(window.atob(padded)))
      : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string; email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        router.replace("/");
        return;
      }
      const session = JSON.parse(raw) as { id_token?: string; exp?: number };
      if (!session?.id_token) {
        router.replace("/");
        return;
      }
      const claims = decodeJwtPayload<{ sub: string; email?: string; name?: string; given_name?: string; family_name?: string }>(session.id_token);
      if (!claims) {
        router.replace("/");
        return;
      }
      const username = claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(" ") || "Google User";
      setUser({ id: claims.sub, username, email: claims.email ?? null });
    } catch (e) {
      console.error("Failed to read session from localStorage", e);
      router.replace("/");
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-gray-900 p-8">
        <p>Loading…</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-white text-gray-900 p-8">
      <h1 className="text-3xl font-semibold mb-4">Your Profile</h1>
      <div className="space-y-2">
        <p><span className="font-medium">Username:</span> {user.username}</p>
        <p><span className="font-medium">Email:</span> {user.email ?? "—"}</p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-600 underline">Back to Home</Link>
      </div>
    </main>
  );
}
