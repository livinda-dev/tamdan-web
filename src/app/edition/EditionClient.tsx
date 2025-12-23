"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeJwtPayload } from "@/lib/auth";
import NewsModal from "@/components/NewsModal";
import Divider from "@/components/divider";

/* ================= TYPES ================= */

type Article = {
  url: string;
  summary: string;
  source_name: string;
  article_title: string;
  image: string;
};

type NewsTopic = {
  section_title: string;
  section_summary: string;
  articles: Article[];
};

type NewsHeader = {
  delivery_date: string;
  topics_covered: string[];
  intro_paragraph: string;
};

type Newsletter = {
  id: string;
  header: NewsHeader;
  topics: NewsTopic[];
};

/* ================= COMPONENT ================= */

export default function EditionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [idToken, setIdToken] = useState<string | null>(null);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedTopic, setSelectedTopic] = useState<NewsTopic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ================= MODAL ================= */

  const openModal = (topic: NewsTopic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTopic(null);
    setIsModalOpen(false);
  };

  /* ================= FETCH ================= */

  const fetchNews = async () => {
    if (!idToken) return;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/news?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const json = await res.json();

      if (json.ok) {
        setNewsletters(json.newsletters);
        setTotalPages(json.totalPages);
      } else {
        setNewsletters([]);
      }
    } catch (e) {
      console.error(e);
      setNewsletters([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchNews();
  }, [idToken, page, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        router.replace("/");
        return;
      }

      const session = JSON.parse(raw) as { id_token?: string };
      if (!session.id_token) {
        router.replace("/");
        return;
      }

      setIdToken(session.id_token);
      decodeJwtPayload(session.id_token);
    } catch {
      router.replace("/");
    }
  }, [router]);

  /* ================= UI ================= */

  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-[120px] py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your News Editions</h1>

        <div className="flex gap-4 items-end">
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="bg-gray-200 px-4 py-2 rounded-md text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : newsletters.length > 0 ? (
        <div className="space-y-12">
          {newsletters.map((newsletter, index) => (
            <React.Fragment key={newsletter.id}>
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Edition for: {newsletter.header.delivery_date}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newsletter.topics.map((topic, i) => (
                    <div
                      key={i}
                      onClick={() => openModal(topic)}
                      className="bg-secondary-color p-6 rounded-lg shadow cursor-pointer"
                    >
                      <h3 className="font-bold text-xl mb-2">
                        {topic.section_title}
                      </h3>
                      <p>{topic.section_summary.slice(0, 150)}...</p>
                    </div>
                  ))}
                </div>
              </div>

              {index < newsletters.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No editions found.
        </p>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && (
        <NewsModal topic={selectedTopic} onClose={closeModal} />
      )}
    </div>
  );
}
