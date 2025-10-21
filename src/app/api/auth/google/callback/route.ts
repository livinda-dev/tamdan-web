// src/app/api/auth/google/callback/route.ts
import { NextRequest } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function decodeJwtPayload<T = any>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payloadB64 = parts[1]
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return new Response(`Google OAuth error: ${error}`, { status: 400 });
  }

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response("Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET", { status: 500 });
  }

  // Build site URL from request origin to exactly match the host the user is on
  const requestOrigin = req.nextUrl.origin;
  const siteUrl = requestOrigin || process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  // Exchange code for tokens
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    return new Response(`Failed to exchange code. ${errText}`, { status: 502 });
  }

  const tokenJson = await tokenRes.json();
  const { id_token, access_token, refresh_token, expires_in, token_type } = tokenJson as {
    id_token?: string;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };

  // Derive user profile either from Google userinfo API or by decoding id_token
  let googleUser: { sub: string; name?: string; email?: string | null } | null = null;
  try {
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (userinfoRes.ok) {
      const info = await userinfoRes.json();
      googleUser = { sub: info.sub, name: info.name, email: info.email ?? null };
    } else {
      console.warn("Failed to fetch Google userinfo", await userinfoRes.text());
    }
  } catch (e) {
    console.warn("Exception fetching Google userinfo", e);
  }
  // If userinfo was unavailable or incomplete, decode id_token (JWT) to get basic claims
  if (!googleUser || !googleUser.name || googleUser.email == null) {
    const claims = decodeJwtPayload<{ sub: string; email?: string; name?: string; given_name?: string; family_name?: string }>(id_token);
    if (claims && claims.sub) {
      const fullName = claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(" ");
      // Debug: print decoded claims (safe subset) after decode
      console.log("[OAuth Callback] Decoded id_token claims:", {
        sub: claims.sub,
        email: claims.email ?? null,
        name: fullName || claims.name || null,
      });
      googleUser = {
        sub: claims.sub,
        name: fullName || googleUser?.name || "Google User",
        email: claims.email ?? googleUser?.email ?? null,
      };
      // Debug: print resolved googleUser profile that will be persisted
      console.log("[OAuth Callback] Resolved googleUser:", googleUser);
    }
  }

  // Do NOT persist anything to Supabase. Per request, we avoid saving data to Supabase.

  // Return a tiny HTML page that stores the session in browser localStorage and then redirects
  const sessionObj = {
    token_type,
    access_token,
    id_token,
    exp: Math.floor(Date.now() / 1000) + (expires_in ?? 3600),
  };

  const sessionB64 = Buffer.from(JSON.stringify(sessionObj)).toString("base64");
  const redirectTo = siteUrl + "/profile"; // go directly to profile; landing will also work

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Signing you in…</title></head>
<body>
<script>
(function(){
  try {
    var json = atob('${sessionB64}');
    localStorage.setItem('session', json);
  } catch (e) {
    console.error('Failed to save session to localStorage', e);
  }
  // Navigate after storing
  window.location.replace('${redirectTo}');
})();
</script>
<p>Signing you in…</p>
</body></html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
