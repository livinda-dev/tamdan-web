"use client";
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthExplorePage from "../auth/explore/page";
import { decodeJwtPayload } from "@/lib/auth";
import NoAuthExplorePage from "../no_auth/explore/page";
import { mockNewsData, NewsTopic, NewsHeader,News } from "./mocknews_data";
import DateNavigator from "@/components/DateNavigator";

export default function ExplorePage() {
  const router = useRouter();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [newsHeader, setNewsHeader] = useState<NewsHeader | null>(null);
  const [newsTopics, setNewsTopics] = useState<NewsTopic[]>([]);
  const [news,setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate,setCurrentDate] = useState<string>(`${new Date().toISOString().split('T')[0]}`);

  const fetchNews  = async (token: string,) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news?date=${currentDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.ok) {
        setNews(json)
      } else {
        console.error("Failed to fetch news:", json.error);
        setNews(null); // Set news to null on failure to avoid showing stale data
      }
    } catch (e) {
      console.error("Failed to fetch news", e);
      setNews(null); // Set news to null on error
    } finally {
      setLoading(false);
    }
  }

 

  const onDateChange = (newDate: string) => {
    setCurrentDate(newDate);
  };

  useEffect(() => {
    if (idToken) {
      fetchNews(idToken);
    }
  }, [idToken, currentDate]);

  //  const loadMockNews = () => {
  //   // Simulate a small delay to show loading state
  //   setLoading(true);
  //   setTimeout(() => {
  //     setNewsHeader(mockNewsData.newsHeader);
  //     setNewsTopics(mockNewsData.newsTopics);
  //     setLoading(false);
  //   }, 500);
  // };

  useEffect(() => {
    if (news?.newsHeader != null) {
      setNewsHeader(news.newsHeader);
      setNewsTopics(news.newsTopics);
    } else{
      // If news is null and not loading, it means there's no news for the date
      setNewsHeader(mockNewsData.newsHeader);
      setNewsTopics(mockNewsData.newsTopics);
      // if(!loading) {
      //   setNewsHeader(null);
      //   setNewsTopics([]);
      // }
      
    }
  }, [news, loading]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        setLoading(false);
        return;
      }
      const session = JSON.parse(raw) as { id_token?: string };
      setIdToken(session.id_token || null);
      decodeJwtPayload<{ email?: string }>(session.id_token);
    } catch (e) {
      console.error("Failed to read session", e);
      router.replace("/");
    }
  }, [router]);
  

  return (
    <div>
      {idToken != null ? (
        <>
          {loading ? (
            <div className="min-h-screen flex flex-col items-center justify-center">
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.2s]"></div>
                <div className="w-4 h-4 bg-primary-color rounded-full animate-bounce [animation-delay:-.4s]"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">
                Loading your daily insights...
              </p>
            </div>
          ) : newsHeader ? (
            <AuthExplorePage newsHeader={newsHeader} newsTopics={newsTopics} topics_covered={newsHeader.topics_covered} />
          ) : (
            <p className="text-center mt-8 text-lg text-gray-500">
              No news available for this date.
            </p>
          )}
        </>
      ) : (
        <NoAuthExplorePage />
      )}
    </div>
  );
}