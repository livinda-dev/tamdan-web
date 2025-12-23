import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";

const CATEGORY_QUERY_MAP: Record<string, string> = {
  general: "trending",
  world: "world news OR international",
  nation: "national news OR government",
  business: "business OR economy OR finance",
  technology: "technology OR AI OR software",
  entertainment: "entertainment OR movie OR music",
  sports: "sports OR football OR basketball",
  science: "science OR research",
  health: "health OR medicine",
};

function getSafeUtcRangeForCambodia() {
  const now = new Date();

  // Go back 36 hours to survive free-tier delays
  const from = new Date(now.getTime() - 36 * 60 * 60 * 1000);

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  };
}


export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) throw new Error("GNEWS_API_KEY is missing");

    const page = Number(req.nextUrl.searchParams.get("page") || 1);
    const category =
      req.nextUrl.searchParams.get("category")?.toLowerCase() || "general";

    const query =
      CATEGORY_QUERY_MAP[category] || CATEGORY_QUERY_MAP.general;

    const { from, to } = getSafeUtcRangeForCambodia();

    const url =
      `https://gnews.io/api/v4/search` +
      `?q=${encodeURIComponent(query)}` +
      `&lang=en` +
      `&sortby=publishedAt` +
      `&from=${from}` +
      `&to=${to}` +
      `&max=5` +
      `&page=${page}` +
      `&apikey=${apiKey}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();

    return NextResponse.json({
      articles: data.articles,
      total: data.totalArticles,
      from,
      to,
    });
  } catch (error) {
    console.error("GNews API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
