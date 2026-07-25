// src/lib/middleware.ts
// Central authentication middleware for API routes.
// Wrap any route handler with `withAuth(handler)` to enforce Bearer token validation.

import { NextRequest } from "next/server";
import { decodeJwtPayload } from "@/lib/auth";

export type JwtClaims = {
  sub: string;
  email?: string;
  name?: string;
  phone_number?: string;
  iat?: number;
  exp?: number;
};

/**
 * Higher-order function that wraps a Next.js API route handler with JWT auth.
 *
 * Usage:
 *   export const GET = withAuth(async (req, claims) => {
 *     // claims.sub, claims.email, etc. are available here
 *     return Response.json({ ok: true });
 *   });
 *
 * If the request is missing a valid Bearer token the wrapper returns 401
 * immediately without calling the inner handler.
 *
 * Routes that do NOT require auth (login, signup, Google OAuth, Telegram bot
 * webhook) should NOT use this wrapper.
 */
export function withAuth(
  handler: (req: NextRequest, claims: JwtClaims) => Promise<Response>
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest): Promise<Response> => {
    // Accept both capitalizations that browsers / fetch clients may send
    const authHeader =
      req.headers.get("Authorization") || req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { ok: false, error: "Missing Authorization Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.slice("Bearer ".length).trim();

    const claims = decodeJwtPayload<{
      sub?: string;
      email?: string;
      name?: string;
      phone_number?: string;
      iat?: number;
      exp?: number;
    }>(token);

    // Require at minimum a subject claim (user id)
    if (!claims?.sub) {
      return Response.json(
        { ok: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return handler(req, {
      sub: claims.sub,
      email: claims.email,
      name: claims.name,
      iat: claims.iat,
      exp: claims.exp,
    });
  };
}
