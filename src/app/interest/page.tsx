"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeJwtPayload } from "@/lib/auth";
import AuthInterestPage from "../auth/interest/page";
import NoAuthLandingPage from "../no_auth/interest/page";

export default function InterestPage() {

   const router = useRouter();
  
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
      try {
        const raw = localStorage.getItem("session");
        if (!raw) {
          return;
        }
        const session = JSON.parse(raw) as { id_token?: string };
        setIdToken(session.id_token || null);
        decodeJwtPayload<{ email?: string }>(session.id_token);
      } catch (e) {
        console.error("Failed to read session", e);
        router.replace("/");
      }
    }, [router]);

  return(
    <div>
      {idToken != null ? (
        <AuthInterestPage />
      ) : (
        <NoAuthLandingPage/>
      )}
    </div>
  )
}
