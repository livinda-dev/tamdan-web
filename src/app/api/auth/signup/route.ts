import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmailFormat, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const phone_number = typeof body?.phone_number === "string" ? body.phone_number.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username) {
      return Response.json({ ok: false, error: "Username is required." }, { status: 400 });
    }

    if (!phone_number) {
      return Response.json({ ok: false, error: "Phone number is required." }, { status: 400 });
    }

    if (!email || !isValidEmailFormat(email)) {
      return Response.json(
        { ok: false, error: "Please enter a valid email address format (e.g. user@example.com)." },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return Response.json(
        { ok: false, error: "Password must be at least 4 characters long." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ ok: false, error: "Database configuration missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // 1. Check if user with email already exists in users table
    const { data: existingUser, error: checkErr } = await supabase
      .from("users")
      .select("id, email, auth_provider, password")
      .eq("email", email)
      .maybeSingle();

    if (checkErr) {
      console.error("[SignUp] Check user error:", checkErr.message);
    }

    // 1.1 Strict Provider Separation: If registered with Google, block email/password signup
    if (existingUser) {
      if (
        existingUser.auth_provider === "google" ||
        (!existingUser.password && existingUser.auth_provider !== "credentials")
      ) {
        return Response.json(
          {
            ok: false,
            error:
              "This email was registered using Google Sign-In. Please sign in using the 'Continue with Google' button.",
            auth_provider: "google",
          },
          { status: 409 }
        );
      }

      return Response.json(
        { ok: false, error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // 1.2 Check if user with phone number already exists in users table
    const { data: existingUserPhone, error: checkErrPhone } = await supabase
      .from("users")
      .select("phone_number")
      .eq("phone_number", phone_number)
      .maybeSingle();

    if (checkErrPhone) {
      console.error("[SignUp] Check user error:", checkErrPhone.message);
    }

    if (existingUserPhone) {
      return Response.json(
        { ok: false, error: "An account with this phone number already exists. Please log in." },
        { status: 409 }
      );
    }

    // 2. Hash password and insert record into users table
    const hashedPassword = hashPassword(password);
    const created_at = new Date().toISOString();

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        username,
        email,
        phone_number,
        password: hashedPassword,
        auth_provider: "credentials",
        is_verified: false,
        created_at,
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("[SignUp] Insert into users error:", insertError.message);
      return Response.json(
        { ok: false, error: `Failed to create account: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 3. Trigger email confirmation using Supabase Auth
    const siteUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    let emailSent = false;
    let authWarning: string | null = null;

    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseKey;
      const authClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false },
      });

      const { data: authData, error: authErr } = await authClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            username,
            phone_number,
            role: "user",
          },
        },
      });

      if (authErr) {
        console.error("[SignUp] Supabase auth.signUp error:", authErr.message);
        authWarning = authErr.message;
        // Rollback inserted user from public.users so they aren't trapped in unverified limbo
        await supabase.from("users").delete().eq("email", email);
        return Response.json(
          {
            ok: false,
            error: `Failed to send verification email: ${authErr.message}. (If you tested recently, you may have hit the Supabase 3 emails/hour rate limit or check Supabase Auth Logs).`,
          },
          { status: 400 }
        );
      } else {
        // If user already existed in auth.users, Supabase returns identities: [] and does not send an email
        if (authData?.user?.identities && authData.user.identities.length === 0) {
          console.log("[SignUp] User already existed in auth.users, triggering resend...");
          const { error: resendErr } = await authClient.auth.resend({
            type: "signup",
            email,
            options: {
              emailRedirectTo: `${siteUrl}/auth/callback`,
            },
          });
          if (resendErr) {
            console.warn("[SignUp] Resend warning:", resendErr.message);
            authWarning = resendErr.message;
          } else {
            emailSent = true;
          }
        } else {
          emailSent = true;
        }
      }
    } catch (authCreateErr) {
      console.warn("[SignUp] Supabase auth creation exception:", authCreateErr);
      authWarning = authCreateErr instanceof Error ? authCreateErr.message : "Unknown auth error";
    }

    return Response.json({
      ok: true,
      requires_verification: true,
      emailSent,
      warning: authWarning,
      message:
        "Account created! A confirmation link has been sent to your email. Please check your inbox (and Spam folder) to verify your account.",
      user: {
        id: newUser?.id || email,
        username,
        email,
        phone_number,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An error occurred during signup.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
