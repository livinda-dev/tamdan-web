"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeJwtPayload } from "@/lib/auth";
import NewsModal from "@/components/NewsModal";
import Divider from "@/components/divider";

// Define the types for the news data
type Article = {
  url: string;
  summary: string;
  source_name: string;
  article_title: string;
  image:string;
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

export default function EditionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<NewsTopic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const openModal = (topic: NewsTopic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTopic(null);
    setIsModalOpen(false);
  };

  const fetchNews = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.ok) {
        setNewsletters(json.newsletters);
      } else {
        console.error("Failed to fetch news:", json.error);
        setNewsletters([]);
      }
    } catch (e) {
      console.error("Failed to fetch news", e);
      setNewsletters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idToken) {
      fetchNews(idToken);
    }
  }, [idToken]);

  useEffect(() => {
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');
    if (start) setStartDate(start);
    if (end) setEndDate(end);
  }, [searchParams]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        setLoading(false);
        // if user is not logged in, redirect to home
        router.replace("/");
        return;
      }
      const session = JSON.parse(raw) as { id_token?: string };
      setIdToken(session.id_token || null);
      if (!session.id_token) {
        router.replace("/");
        return;
      }
      decodeJwtPayload<{ email?: string }>(session.id_token);
    } catch (e) {
      console.error("Failed to read session", e);
      router.replace("/");
    }
  }, [router]);

  const filteredNewsletters = useMemo(() => {
    const parseDateAsUTC = (dateString: string) => {
      if (!dateString) return null;
      const parts = dateString.split("-");
      if (parts.length !== 3) return null;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);
      return new Date(Date.UTC(year, month, day));
    };

    const start = parseDateAsUTC(startDate);
    const end = parseDateAsUTC(endDate);

    return newsletters.filter((newsletter) => {
      const deliveryDate = parseDateAsUTC(newsletter.header.delivery_date);
      if (!deliveryDate) return false;

      if (start && deliveryDate < start) {
        return false;
      }
      if (end && deliveryDate > end) {
        return false;
      }
      return true;
    });
  }, [newsletters, startDate, endDate]);

  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-[120px] py-8">   
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your News Editions</h1>
        <div className="flex items-end gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-primary-color"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-primary-color"
            />
          </div>
          <div>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.2s]"></div>
            <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.4s]"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading your editions...
          </p>
        </div>
      ) : filteredNewsletters && filteredNewsletters.length > 0 ? (
        <div className="space-y-12">
          {filteredNewsletters.map((newsletter, index) => (
            <React.Fragment key={newsletter.id}>
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold">
                    Edition for: {newsletter.header.delivery_date}
                  </h2>
                  {newsletter.header.topics_covered && (
                    <p className="text-gray-600">
                      Topics covered: {newsletter.header.topics_covered.join(", ")}
                    </p>
                  )}
                  {
                    newsletter.header.intro_paragraph && (
                      <p className="mt-4 text-gray-700">
                        {newsletter.header.intro_paragraph}
                      </p>
                    )
                  }
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                  {newsletter.topics.map((topic, index) => (
                    <div
                      key={index}
                      className="bg-secondary-color p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-[#00355A] border-1"
                      onClick={() => openModal(topic)}
                    >
                      <h3 className="font-bold text-xl mb-2">{topic.section_title}</h3>
                      <p className="text-gray-700">
                        {topic.section_summary.substring(0, 150)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {index < filteredNewsletters.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <p className="text-center mt-8 text-lg text-gray-500">
          No news editions available for the selected date range.
        </p>
      )}

      {isModalOpen && <NewsModal topic={selectedTopic} onClose={closeModal} />}
    </div>
  );
}
