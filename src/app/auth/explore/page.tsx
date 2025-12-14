"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { decodeJwtPayload } from "@/lib/auth";

/* ================= TYPES ================= */

type Article = {
  article_title: string;
  summary: string;
  source_name: string;
  url: string;
  image?: string;
};

type NewsTopic = {
  section_title: string;
  section_summary: string;
  articles: Article[];
};

type NewsHeader = {
  delivery_date: string;
};

type Props = {
  newsHeader?: NewsHeader;
  newsTopics?: NewsTopic[];
  topics_covered?: string[];
};

/* ================= CONFIG ================= */

const PAGE_SIZE = 5;

const CATEGORIES = [
  "General",
  "World",
  "Nation",
  "Business",
  "Technology",
  "Entertainment",
  "Sports",
  "Science",
  "Health",
];

/* ================= COMPONENT ================= */

export default function AuthExplorePage(_: Props) {
  const router = useRouter();

  const [idToken, setIdToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("General");
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= AUTH ================= */

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        router.replace("/");
        return;
      }

      const session = JSON.parse(raw) as { id_token?: string };
      if (!session?.id_token) return;

      setIdToken(session.id_token);
      const claims = decodeJwtPayload<{ email?: string }>(session.id_token);
      setUserEmail(claims?.email ?? null);
    } catch (e) {
      console.error("Failed to read session", e);
    }
  }, [router]);

  /* ================= FETCH NEWS ================= */

  const fetchNews = async (token: string, page: number) => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/world-news?page=${page}&category=${selectedCategory.toLowerCase()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch news");

      const data = await res.json();

      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Fetch news error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idToken) {
      fetchNews(idToken, page);
    }
  }, [idToken, page, selectedCategory]);

  /* ================= DATA MAPPING ================= */

  const mappedTopics: NewsTopic[] = [
    {
      section_title: selectedCategory,
      section_summary: `Latest ${selectedCategory.toLowerCase()} news updates.`,
      articles: articles.map((a) => ({
        article_title: a.title,
        summary:
          a.description || (a.content ? a.content.slice(0, 180) + "..." : ""),
        source_name: a.source?.name || "Unknown",
        url: a.url,
        image: a.image, // ✅ THIS IS REQUIRED
      })),
    },
  ];

  /* ================= UI HELPERS ================= */

  const toggle = (idx: number) => {
    setOpenSections((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.2s]"></div>
          <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.4s]"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
          Loading your profile...
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-[120px]">
      {/* HEADER */}
      <div className="text-center py-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
          Explore Trending News of{" "}
          <span className="primary-color font-bold">TAMDAN</span>
        </h1>
      </div>

      {/* CATEGORIES */}
      <div className="overflow-x-auto scrollbar-hide mb-6">
        <div className="flex gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      {/* TOPICS */}
      {mappedTopics.map((topic, i) => (
        <div key={i} className="border-t pt-6">
          <button
            className="flex items-center gap-2 font-semibold text-lg w-full text-left"
            onClick={() => toggle(i)}
          >
            <ChevronRightIcon
              className={`h-5 w-5 transition-transform ${
                openSections.includes(i) ? "rotate-90" : ""
              }`}
            />
            {topic.section_title}
          </button>

          {openSections.includes(i) && (
            <div className="mt-4 space-y-6 pl-7">
              <p className="text-gray-700">{topic.section_summary}</p>

              {topic.articles.map((a, j) => (
                <div key={j} className="border rounded p-4 flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                    {a.article_title}
                  </h3>
                  <p className="text-sm text-gray-700 mt-2">{a.summary}</p>
                  <p className="text-sm mt-2 text-primary-color">
                    Source: {a.source_name}
                  </p>
                  <a
                    href={a.url}
                    target="_blank"
                    className="text-sm text-indigo-600 underline mt-2 inline-block"
                  >
                    Read Full Article →
                  </a>
                    </div>
                    <div>
                      {a.image && (
                    <img
                      src={a.image}
                      alt={a.article_title}
                      className="w-[248px] h-[128px] object-cover rounded-md mt-3"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}

                      </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* PAGINATION */}
      {total > PAGE_SIZE && (
        <div className="flex justify-center items-center gap-4 my-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
          >
            ← Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / PAGE_SIZE)}
          </span>

          <button
            disabled={page >= Math.ceil(total / PAGE_SIZE)}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* SCROLLBAR HIDE */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
