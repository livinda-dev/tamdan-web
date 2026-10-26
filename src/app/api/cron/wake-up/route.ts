import { NextResponse } from "next/server";

export const maxDuration = 60; // Max allowed execution time (seconds)
export const dynamic = "force-dynamic";

const TARGET_URLS = [
  "https://news-pro-5cab.onrender.com/",
  "https://n8n-service-rtt5.onrender.com",
];

export async function GET(request: Request) {
  // Optional verification for Vercel Cron or secret authorization
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.allSettled(
    TARGET_URLS.map(async (url) => {
      const startTime = Date.now();
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": "RenderWakeUpCron/1.0",
          },
          // 60-second timeout to allow Render free tier containers time to spin up
          signal: AbortSignal.timeout(60000),
        });

        return {
          url,
          status: response.status,
          ok: response.ok,
          durationMs: Date.now() - startTime,
        };
      } catch (err: unknown) {
        return {
          url,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - startTime,
        };
      }
    })
  );

  return NextResponse.json({
    message: "Wake-up ping executed",
    timestamp: new Date().toISOString(),
    results: results.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : {
            url: TARGET_URLS[i],
            ok: false,
            error: (r as PromiseRejectedResult).reason,
          }
    ),
  });
}
