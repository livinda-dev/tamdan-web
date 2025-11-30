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
    <div className="min-h-screen px-4 sm:px-6 md:px-12 lg:px-[96px]">
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
