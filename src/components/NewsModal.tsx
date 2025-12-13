"use client";
import React from "react";

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

type Props = {
  topic: NewsTopic | null;
  onClose: () => void;
};

export default function NewsModal({ topic, onClose }: Props) {
  if (!topic) {
    return null;
  }

  return (
    <div className="fixed inset-0  bg-opacity-10 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{topic.section_title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-6">{topic.section_summary}</p>
        <div className="space-y-6">
          {topic.articles.map((article, index) => (
            <div key={index} className="border-t pt-4">
              <h3 className="font-semibold text-lg">{article.article_title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Source: {article.source_name}
              </p>
              <p className="mt-2">{article.summary}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-color hover:underline mt-2 inline-block"
              >
                Read Full Article
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
