// src/app/api/auth/google/debug/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || null;
  const siteUrlFromEnv = process.env.NEXT_PUBLIC_SITE_URL || null;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;

  const origin = req.nextUrl.origin;
  const siteUrl = origin || siteUrlFromEnv || vercelUrl || "http://localhost:3000";
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  return Response.json({
    ok: true,
    message: "Use the following redirect_uri in Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs.",
    origin,
    siteUrlUsed: siteUrl,
    redirect_uri: redirectUri,
    env: {
      has_GOOGLE_CLIENT_ID: !!clientId,
      NEXT_PUBLIC_SITE_URL: siteUrlFromEnv,
      VERCEL_URL: vercelUrl,
      NODE_ENV: process.env.NODE_ENV || null,
    },
    tips: [
      "Ensure the exact redirect_uri is added (scheme, host, port, and path must match).",
      "Do not add a trailing slash at the end of the callback path.",
      "If using a different port (e.g., 3001), update Google Console accordingly.",
      "On LAN or with a custom domain, the origin must match what the browser shows in the address bar.",
    ],
  });
}
