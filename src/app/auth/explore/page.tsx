"use client";
import { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

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
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const toggle = (idx: number) => {
    setOpenSections((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  if (!newsHeader || !newsTopics) {
    return null;
  }

  return (
    <div className="min-h-screen px-[96px]">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <p className="text-gray-600">{newsHeader.delivery_date}</p>
          <p className="mt-3 text-gray-800">{newsHeader.intro_paragraph}</p>
        </div>

        {/* Topics */}
        {newsTopics.map((topic, i) => (
          <div key={i} className="border-t pt-4">
            {/* Toggle */}
            <button
              className="flex items-center gap-2 text-lg font-semibold w-full text-left"
              onClick={() => toggle(i)}
            >
              <ChevronRightIcon
                className={`h-5 transition-transform cursor-pointer ${
                  openSections.includes(i) ? "rotate-90" : ""
                }`}
              />
              {topic.section_title}
            </button>

            {/* Content */}
            {openSections.includes(i) && (
              <div className="mt-4 space-y-6 pl-7">

                <p className="text-gray-700">{topic.section_summary}</p>

                {topic.articles.map((a, j) => (
                  <div
                    key={j}
                    className=" p-4"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {a.article_title}
                    </h3>
                    <p className="mt-2 text-gray-700">{a.summary}</p>
                    <p className="mt-2 text-sm text-blue-600">
                      Source: {a.source_name}
                    </p>
                    <a
                      href={a.url}
                      target="_blank"
                      className="text-sm mt-1 inline-block text-indigo-600 underline"
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
