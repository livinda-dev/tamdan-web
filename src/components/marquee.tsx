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
      const [lastTwoDays,setLastTwoDays] = useState<string>(`${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`);
      const [yesterday,setYesterday] = useState<string>(`${new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`);

    const fetchNews  = async (token: string,) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      const lastTwoDaysNews = json?.newsletters?.filter((nl: any) => nl.header?.delivery_date == lastTwoDays);
      const yesterdayNews = json?.newsletters?.filter((nl: any) => nl.header?.delivery_date == yesterday);
      const todayNews = json?.newsletters?.filter((nl: any) => nl.header?.delivery_date == currentDate);
      if (json.ok) {
        setNewsTopics(lastTwoDaysNews[0]?.topics || []);
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

  return (
    <div onClick={() => router.push(`/edition?startDate=${lastTwoDays}&endDate=${lastTwoDays}`)}>
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
    </div>
  );


}
