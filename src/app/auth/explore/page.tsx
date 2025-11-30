"use client";
import { useState,useEffect } from "react";
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
  intro_paragraph: string;
};

type Props = {
  newsHeader: NewsHeader;
  newsTopics: NewsTopic[];
};

export default function AuthExplorePage({ newsHeader, newsTopics }: Props) {
  const router = useRouter();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<number[]>([0]);
  const [content, setContent] = useState("");


  const fetchEntries = async (token: string) => {
    try {
      const res = await fetch("/api/entries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.ok) {
        const dbContent = json.title || ""; // comma separated from DB
        setSavedContent(dbContent);
        if (dbContent) {
          const withDashes = dbContent
            .split(",")
            .map((t: string) => `• ${t.trim()}`)
            .join("\n");

          setContent(withDashes);
        } else {
          setContent("");
        }
      } else {
        setContent("");
      }
    } catch (e) {
      console.error("Failed to fetch entries", e);
      setContent("");
    }
  };
  
    useEffect(() => {
      if (idToken) {
        fetchEntries(idToken);
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

  if (!newsHeader || !newsTopics) {
    return null;
  }

  

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 lg:px-[96px]">
      <div className="mx-auto sm:w-[100%] md:w-[60%] lg:w-[50%]">
        <form>
          <div className="relative mt-4 sm:mt-6 md:mt-8">
            <textarea
              value={content}
              disabled={true}
              maxLength={200}
              className="w-full h-64 sm:h-72 md:h-80 px-4 sm:px-6 md:px-9 py-4 sm:py-6 md:py-8 bg-white font-tamdan-placeholder leading-relaxed"
              onChange={(e) => {
                const value = e.target.value;

                let lines = value.split("\n");

                // Count only non-empty lines (ignore blank lines)
                const nonEmptyCount = lines.filter(
                  (l) => l.trim() !== ""
                ).length;


                const formatted = lines
                  .map((line) => {
                    // Allow blank lines normally
                    if (line.trim() === "") return "";

                    // Remove ONLY one leading bullet + optional space OR dash
                    const withoutBullet = line.replace(/^[•\-]\s?/, "");

                    // Limit each line to 50 characters
                    const limited = withoutBullet.slice(0, 50);

                    // Final line must always start with "• "
                    return `• ${limited}`;
                  })
                  .join("\n");

                setContent(formatted);
              }}
              rows={5}
            />
          </div>
        </form>
      </div>
      <div className="space-y-6 sm:space-y-8 md:space-y-10">

        {/* Header */}
        <div>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">{newsHeader.delivery_date}</p>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-gray-800 leading-relaxed">{newsHeader.intro_paragraph}</p>
        </div>

        {/* Topics */}
        {newsTopics.map((topic, i) => (
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

                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{topic.section_summary}</p>

                {topic.articles.map((a, j) => (
                  <div
                    key={j}
                    className=" p-4 sm:p-5"
                  >
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                      {a.article_title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-gray-700 leading-relaxed">{a.summary}</p>
                    <p className="mt-2 text-xs sm:text-sm text-blue-600">
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
        ))}

      </div>
    </div>
  );
}
