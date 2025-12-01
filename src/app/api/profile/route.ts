import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Same decoder
function decodeJwtPayload<T = unknown>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const json = Buffer.from(parts[1], "base64").toString("utf8");
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return Response.json({ ok: false, error: "Missing token" }, { status: 401 });
    }

    const idToken = auth.replace("Bearer ", "");
    const claims = decodeJwtPayload<{ email?: string }>(idToken);

    if (!claims?.email) {
      return Response.json({ ok: false, error: "Invalid token" }, { status: 401 });
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ ok: false, error: "Supabase env missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Fetch Supabase user by email
    const { data: user, error: userErr } = await supabase
      .from("user")
      .select("*")
      .eq("email", claims.email)
      .maybeSingle();

    if (userErr) {
      return Response.json({ ok: false, error: userErr.message }, { status: 502 });
    }

    if (!user) {
      return Response.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    return Response.json({ ok: true, user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return Response.json({ ok: false, error: "Missing token" }, { status: 401 });
    }

    const idToken = auth.replace("Bearer ", "");
    const claims = decodeJwtPayload<{ email?: string }>(idToken);

    if (!claims?.email) {
      return Response.json({ ok: false, error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const username = typeof body?.username === "string" ? body.username.trim() : undefined;
    const secondaryEmail = typeof body?.secondary_email === "string" ? body.secondary_email.trim() : undefined;
    const chatId = body?.chat_id;

    if (username === undefined && secondaryEmail === undefined && chatId === undefined) {
      return Response.json({ ok: false, error: "Missing fields to update" }, { status: 400 });
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ ok: false, error: "Supabase env missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // If updating secondary_email, ensure it's not already used by another user
    if (secondaryEmail !== undefined) {
      // check email column
      const { data: existingEmail, error: e1 } = await supabase
        .from("user")
        .select("email, secondary_email")
        .eq("email", secondaryEmail)
        .limit(1);

      if (e1) {
        return Response.json({ ok: false, error: e1.message }, { status: 502 });
      }

      if (existingEmail && existingEmail.length > 0) {
        // If found and it's not the current user, conflict
        if (existingEmail[0].email !== claims.email) {
          return Response.json({ ok: false, error: "Email already in use" }, { status: 409 });
        }
      }

      // check secondary_email column
      const { data: existingSecondary, error: e2 } = await supabase
        .from("user")
        .select("email, secondary_email")
        .eq("secondary_email", secondaryEmail)
        .limit(1);

      if (e2) {
        return Response.json({ ok: false, error: e2.message }, { status: 502 });
      }

      if (existingSecondary && existingSecondary.length > 0) {
        if (existingSecondary[0].email !== claims.email) {
          return Response.json({ ok: false, error: "Email already in use" }, { status: 409 });
        }
      }
    }

    const updates: Record<string, unknown> = {};
    if (username !== undefined) updates.username = username;
    if (secondaryEmail !== undefined) updates.secondary_email = secondaryEmail;
    if (chatId !== undefined) updates.chat_id = chatId;


    // Update user by email
    const { data, error } = await supabase
      .from("user")
      .update(updates)
      .eq("email", claims.email)
      .select()
      .maybeSingle();

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }

    return Response.json({ ok: true, user: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
