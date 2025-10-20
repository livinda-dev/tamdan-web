"use client";

import React,{useState} from "react";
import GoogleSignInModal from "./googleButton";

export default function LandingPage() {
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const handleOpenGoogle = () => {
    setIsGoogleModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-[#f8f6f2] text-gray-800 flex flex-col items-center px-6">
      {/* Announcement Bar */}
      <div className="text-sm text-gray-500">
        ✦ ANNOUNCING DISCOVERY DAILY:{" "}
        <a
          href="#"
          className="underline hover:text-gray-700 transition-colors"
        >
          READ OUR LAUNCH STORY →
        </a>
      </div>

      {/* Logo */}
      <div className="mb-6">
        <div className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-700 rounded-full"></div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-serif tracking-wider text-gray-900 mb-2 text-center">
        តាមដាន Tamdan
      </h1>

      {/* Subtitle */}
      <p className="text-gray-500 uppercase tracking-widest mb-10 text-center text-sm">
        Personalized AI Search Agent System
      </p>

      {/* Description */}
      <p className="text-center max-w-2xl text-gray-700 leading-relaxed mb-16">
        <span className="font-semibold">Every morning</span>, receive a curated
        digest of papers, repositories, discussions, and news from the last 24
        hours{" "}
        <span className="font-semibold">
          tailored precisely to your interests.
        </span>
      </p>

      {/* How it works */}
      <div className="text-center">
        <h2 className="text-xs text-gray-500 tracking-widest mb-6">
          HOW IT WORKS
        </h2>

        <div className="space-y-10 text-left max-w-lg mx-auto">
          {/* Step 1 */}
          <div className="flex items-start space-x-6">
            <div className="text-gray-400 font-mono text-sm">01</div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                List What You Want Monitored
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                From brain computer interfaces to NBA trades, new LLM releases
                to DJ sets in your city.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-6">
            <div className="text-gray-400 font-mono text-sm">02</div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                AI Agents Search the Web
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Agents scan ArXiv, GitHub, HackerNews, and the broader web for
                the most relevant content from the past 24 hours.
              </p>
            </div>
          </div>
          {/* Step 3 */}
          <div className="flex items-start space-x-6">
            <div className="text-gray-400 font-mono text-sm">03</div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Receive Your Daily Brief
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed ">
                Wake up to a beautifully formatted newsletter with summaries, key insights, and links to dive deeper.
              </p>
            </div>
          </div>
        </div>
        <div>
            <button className=" bg-black text-white w-[200px] h-[50px] cursor-pointer" onClick={handleOpenGoogle}>Get Started</button>
        </div>
      </div>
      <GoogleSignInModal isOpen={isGoogleModalOpen} onClose={() => setIsGoogleModalOpen(false)} />
    </div>
    );
}
