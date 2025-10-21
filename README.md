This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Google OAuth Setup

This project uses a custom Google OAuth flow via Next.js API routes.

Authorized redirect URIs you must add in Google Cloud Console → Credentials → Your OAuth 2.0 Client → Authorized redirect URIs:
- Local: http://localhost:3000/api/auth/google/callback
- Production: https://YOUR_DOMAIN/api/auth/google/callback

Environment variables (set in .env.local):
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
# Site URL used to build the redirect_uri precisely
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Notes:
- redirect_uri_mismatch happens when the exact URL above is not listed in Google → Authorized redirect URIs. Ensure the scheme, domain, port, and path match exactly (no trailing slashes).
- On Vercel, you can also omit NEXT_PUBLIC_SITE_URL and the app will fallback to https://<VERCEL_URL>.

To start the flow locally, click the Google button in the UI or visit /api/auth/google.

## Supabase Setup

This project includes minimal Supabase wiring. On successful Google login, the server will upsert the user into your Supabase `user` table with columns: id (pk), username (varchar not null), email (text null), password (varchar null), created_at (timestamp). If your `id` column is auto-increment, the server will NOT send a value for `id`; instead, it upserts by `email` when available (onConflict: "email"), otherwise performs a plain insert.

1. Install dependencies (already in package.json):
   - @supabase/supabase-js
2. Create a `.env.local` file (do not commit) and set:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Optional server-side key (never expose to the browser)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
3. The callback route will use SUPABASE_SERVICE_ROLE_KEY for writes when present; otherwise it falls back to the anon key (requires RLS to permit inserts into user table).

Notes:
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit it to git.


### Google OAuth Debugging

- This app computes redirect_uri dynamically from the request origin to avoid mismatches.
- To see the exact redirect_uri your environment uses, open: http://localhost:3000/api/auth/google/debug (or your deployed URL with the same path).
- Copy the "redirect_uri" value shown there and add it to Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client → Authorized redirect URIs.

### Session cookie decoding and user info

- After successful login, the server sets an HttpOnly cookie named `session` containing a base64url-encoded JSON with fields like `id_token` and `access_token`.
- The `id_token` is a JWT. The app decodes it server-side (no external libs) to extract claims such as `sub` (user id), `email`, and `name`.
- The Google OAuth callback now uses the decoded `id_token` as a fallback to fill in username/email if the userinfo API isn’t available, then upserts the user into your Supabase `user` table.
- For verification during development, visit `/api/auth/me` to see the decoded user snapshot from your current cookie.
