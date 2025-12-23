import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/* ================= JWT DECODE ================= */

function decodeJwtPayload<T = unknown>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;

  const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/* ================= GET ================= */

export async function GET(req: NextRequest) {
  try {
    /* ---------- AUTH ---------- */
    const auth =
      req.headers.get("authorization") ||
      req.headers.get("Authorization");

    if (!auth?.startsWith("Bearer ")) {
      return Response.json(
        { ok: false, error: "Missing Authorization token" },
        { status: 401 }
      );
    }

    const idToken = auth.slice("Bearer ".length).trim();
    const claims = decodeJwtPayload<{ email?: string }>(idToken);

    if (!claims?.email) {
      return Response.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    /* ---------- SUPABASE ---------- */
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { ok: false, error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    /* ---------- USER ---------- */
    const { data: user, error: userErr } = await supabase
      .from("user")
      .select("id")
      .eq("email", claims.email)
      .maybeSingle();

    if (userErr || !user?.id) {
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    /* ---------- PAGINATION ---------- */
    const page = Math.max(
      1,
      Number(req.nextUrl.searchParams.get("page")) || 1
    );
    const limit = Math.min(
      20,
      Math.max(
        1,
        Number(req.nextUrl.searchParams.get("limit")) || 5
      )
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    /* ---------- DATE FILTER ---------- */
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    let query = supabase
      .from("user_newsletter")
      .select("id, header, topics, user_id, created_at", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("created_at", `${startDate}T00:00:00Z`);
    }

    if (endDate) {
      query = query.lte("created_at", `${endDate}T23:59:59Z`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      return Response.json(
        { ok: false, error: error.message },
        { status: 502 }
      );
    }

    return Response.json({
      ok: true,
      page,
      limit,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
      newsletters: data ?? [],
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
