// src/app/api/auth/me/route.ts
import { cookies } from "next/headers";

function base64UrlToJson<T = any>(b64url: string): T | null {
  try {
    const json = Buffer.from(b64url, "base64url").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

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

export async function GET() {
  const store = await cookies();
  const session = store.get("session");
  if (!session?.value) {
    return Response.json({ ok: false, error: "No session cookie" }, { status: 401 });
  }

  const payload = base64UrlToJson<{ id_token?: string; access_token?: string; exp?: number }>(session.value);
  if (!payload) {
    return Response.json({ ok: false, error: "Invalid session format" }, { status: 400 });
  }

  const claims = decodeJwtPayload<{ sub: string; email?: string; name?: string; given_name?: string; family_name?: string }>(payload.id_token);
  if (!claims) {
    return Response.json({ ok: false, error: "Unable to decode id_token" }, { status: 400 });
  }

  const username = claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(" ") || "Google User";
  const result = {
    ok: true,
    exp: payload.exp ?? null,
    user: {
      id: claims.sub,
      username,
      email: claims.email ?? null,
    },
  };

  // Debug: print the result after decode for inspection in server logs
  console.log("[Auth Me] Decoded session result:", result);

  return Response.json(result);
}
