"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthExplorePage from "../auth/explore/page";
import { decodeJwtPayload } from "@/lib/auth";
import NoAuthExplorePage from "../no_auth/explore/page";
import { mockNewsData, Article, NewsTopic, NewsHeader } from "./mocknews_data";

export default function ExplorePage() {
  const router = useRouter();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [newsHeader, setNewsHeader] = useState<NewsHeader | null>(null);
  const [newsTopics, setNewsTopics] = useState<NewsTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMockNews = () => {
    // Simulate a small delay to show loading state
    setTimeout(() => {
      setNewsHeader(mockNewsData.newsHeader);
      setNewsTopics(mockNewsData.newsTopics);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (idToken) {
      loadMockNews();
    }
  }, [idToken]);

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
        loading ? (
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
          <AuthExplorePage newsHeader={newsHeader} newsTopics={newsTopics} />
        ) : (
          <p>No news available.</p>
        )
      ) : (
        <NoAuthExplorePage />
      )}
    </div>
  );
}