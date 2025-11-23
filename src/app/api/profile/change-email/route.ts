import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return Response.json(
        { ok: false, error: "Missing token" },
        { status: 401 }
      );
    }

    const idToken = auth.replace("Bearer ", "");
    const claims = decodeJwtPayload<{ email?: string; sub?: string }>(idToken);

    if (!claims?.email) {
      return Response.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const newEmail = typeof body?.new_email === "string" ? body.new_email.trim() : undefined;
    const originalEmail = typeof body?.original_email === "string" ? body.original_email.trim() : undefined;

    if (!newEmail) {
      return Response.json(
        { ok: false, error: "Missing new_email field" },
        { status: 400 }
      );
    }

    if (!originalEmail) {
      return Response.json(
        { ok: false, error: "Missing original_email field" },
        { status: 400 }
      );
    }

    // Check if new email is the same as original email
    if (newEmail === originalEmail) {
      return Response.json(
        { 
          ok: false, 
          error: "Please log in with a different Google account. You selected the same email as your current account." 
        }, 
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { ok: false, error: "Supabase env missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // First, get the user by their original email from Supabase
    const { data: currentUser, error: fetchError } = await supabase
      .from("user")
      .select("email")
      .eq("email", originalEmail)
      .maybeSingle();

    if (fetchError) {
      return Response.json(
        { ok: false, error: fetchError.message },
        { status: 502 }
      );
    }

    if (!currentUser) {
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Now check if new email is the same as current email in Supabase
    if (newEmail === currentUser.email) {
      return Response.json(
        { ok: false, error: "New email is the same as current email" },
        { status: 400 }
      );
    }

    // Check if new email already exists in the system
    const { data: existingUser, error: checkError } = await supabase
      .from("user")
      .select("email")
      .eq("email", newEmail)
      .maybeSingle();

    if (checkError) {
      return Response.json(
        { ok: false, error: checkError.message },
        { status: 502 }
      );
    }

    if (existingUser) {
      return Response.json(
        {
          ok: false,
          error: "This email already exists in the system. Please use a different email.",
          code: "EMAIL_EXISTS",
        },
        { status: 409 }
      );
    }

    // Email doesn't exist, so update the current user's email
    const { data: updatedUser, error: updateError } = await supabase
      .from("user")
      .update({ email: newEmail })
      .eq("email", originalEmail)
      .select()
      .maybeSingle();

    if (updateError) {
      return Response.json(
        { ok: false, error: updateError.message },
        { status: 502 }
      );
    }

    if (!updatedUser) {
      return Response.json(
        { ok: false, error: "Failed to update email" },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, user: updatedUser });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
