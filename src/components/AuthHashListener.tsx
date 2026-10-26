"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthHashListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const hashParams = new URLSearchParams(hash);
    const type = (hashParams.get("type") || "").toLowerCase();

    // Avoid infinite redirect loops if already on callback or reset-password
    if (pathname?.startsWith("/auth/callback") || pathname?.startsWith("/auth/reset-password")) {
      return;
    }

    if (type === "recovery") {
      router.replace(`/auth/reset-password${window.location.hash}`);
      return;
    }

    if (type === "magiclink" || type === "signup" || hashParams.has("access_token")) {
      // If landing on home page with magiclink token, forward to callback handler
      if (type === "magiclink") {
        router.replace(`/auth/callback${window.location.hash}`);
      }
    }
  }, [pathname, router]);

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          if (!window.location.pathname.startsWith("/auth/reset-password")) {
            router.push(`/auth/reset-password${window.location.hash}`);
          }
        }
      });

      return () => {
        data.subscription.unsubscribe();
      };
    } catch (e) {
      console.warn("[AuthHashListener] Initialization warning:", e);
    }
  }, [router]);

  return null;
}
