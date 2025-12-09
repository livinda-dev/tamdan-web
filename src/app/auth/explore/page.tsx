"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { decodeJwtPayload } from "@/lib/auth";

type Article = {
  url: string;
  summary: string;
  source_name: string;
  article_title: string;
};

type NewsTopic = {
  section_title: string;
  section_summary: string;
  articles: Article[];
};

type NewsHeader = {
  delivery_date: string;
  // intro_paragraph: string;
};

type Props = {
  newsHeader: NewsHeader;
  newsTopics: NewsTopic[];
  topics_covered: string[];
};

// Define categories for filtering
const CATEGORIES = [
  "All",
  "Wars",
  "Politics",
  "Technology",
  "Business",
  "Economy",
  "Stock Market",
  "Border",
  "AI",
  "Cryptocurrency",
  "Climate",
  "Health",
  "Education",
  "Science",
  "Sports",
  "Entertainment",
  "Lifestyle",
  "Travel",
  "Culture",
  "Environment",
  "Agriculture",
  "Real Estate",
  "Law & Crime",
  "World",
  "Local",
  "Space",
];

export default function AuthExplorePage({
  newsHeader,
  newsTopics,
  topics_covered,
}: Props) {
  const router = useRouter();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<number[]>([0]);
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (topics_covered != null) {
      const dbsContent = topics_covered.join(",");
      setSavedContent(dbsContent);
      if (dbsContent) {
        const withDashes = dbsContent
          .split(",")
          .map((t: string) => `• ${t.trim()}`)
          .join("\n");

        setContent(withDashes);
      } else {
        setContent("");
      }
    }
  });

  useEffect(() => {
    if (idToken) {
      // fetchEntries(idToken);
    }
  }, [idToken]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        router.replace("/");
        return;
      }
      const session = JSON.parse(raw) as { id_token?: string };
      if (!session?.id_token) {
        return;
      }
      setIdToken(session.id_token);
      const claims = decodeJwtPayload<{ email?: string }>(session.id_token);
      setUserEmail(claims?.email ?? null);
    } catch (e) {
      console.error("Failed to read session", e);
    }
  }, [router]);

  const toggle = (idx: number) => {
    setOpenSections((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Filter news topics based on selected category
  const filteredNewsTopics =
    selectedCategory === "All"
      ? newsTopics
      : newsTopics.filter((topic) =>
          topic.section_title
            .toLowerCase()
            .includes(selectedCategory.toLowerCase())
        );

  if (!newsHeader || !newsTopics) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-[120px]">
      <div className="space-y-8 sm:space-y-10 md:space-y-12">
        <div className="space-y-6 sm:space-y-8">
          <p className="items-center text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Explore -- Here are explore trending news of
            <span className="primary-color font-bold"> TAMDAN</span>
          </p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        <div>
          {/* Category Filter - YouTube style */}
          <div className="mt-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
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

          {/* Results count
          <p className="mt-4 text-sm text-gray-500">
            {filteredNewsTopics.length}{" "}
            {filteredNewsTopics.length === 1 ? "topic" : "topics"} found
          </p> */}
        </div>

        {/* Topics */}
        {filteredNewsTopics.length > 0 ? (
          filteredNewsTopics.map((topic, i) => (
            <div key={i} className="border-t pt-4 sm:pt-6">
              {/* Toggle */}
              <button
                className="flex items-center gap-2 text-base sm:text-lg font-semibold w-full text-left"
                onClick={() => toggle(i)}
              >
                <ChevronRightIcon
                  className={`h-5 w-5 transition-transform cursor-pointer flex-shrink-0 ${
                    openSections.includes(i) ? "rotate-90" : ""
                  }`}
                />
                <span className="break-words">{topic.section_title}</span>
              </button>

              {/* Content */}
              {openSections.includes(i) && (
                <div className="mt-4 space-y-6 pl-7">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {topic.section_summary}
                  </p>

                  {topic.articles.map((a, j) => (
                    <div key={j} className=" p-4 sm:p-5">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                        {a.article_title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {a.summary}
                      </p>
                      <p className="mt-2 text-xs sm:text-sm text-primary-color">
                        Source: {a.source_name}
                      </p>
                      <a
                        href={a.url}
                        target="_blank"
                        className="text-xs sm:text-sm mt-2 inline-block text-indigo-600 underline"
                      >
                        Read Full Article →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No news found for "{selectedCategory}"
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-4 text-primary-color hover:underline"
            >
              View all news
            </button>
          </div>
        )}
      </div>

      {/* Hide scrollbar for horizontal scroll */}
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
