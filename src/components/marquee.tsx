"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeJwtPayload } from "@/lib/auth";
import Marquee from "react-fast-marquee";

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

export default function MyMarquee() {

    const router = useRouter();
      const [idToken, setIdToken] = useState<string | null>(null);
      const [newsTopics, setNewsTopics] = useState<NewsTopic[]>([]);
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
        setNewsTopics(json.newsTopics || []);
      } else {
        console.error("Failed to fetch news:", json.error);
      }
    } catch (e) {
      console.error("Failed to fetch news", e);
    } finally {
      setLoading(false);
    }
  }

    useEffect(() => {
        if (idToken) {
          fetchNews(idToken);
        }
      }, [idToken, currentDate]);

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

      console.log("Marquee News Topics:", newsTopics?.map(topic => topic.section_summary).join(", "));
  return (
    <Marquee  
        className="
        background-color text-black py-2 px-4 text-sm md:text-base lg:text-lg mt-4  
        "
    direction="left" speed={40}  pauseOnHover gradient={false}>
       {
        newsTopics.map((topic, index) => (
          <span key={index} className="mx-8">
            <strong>🚀{topic.section_title}:</strong> {topic.section_summary}
          </span>
        ))
      }
    </Marquee>
  );


}
