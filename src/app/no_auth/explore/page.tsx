"use client";
import SampleNews from "@/components/sampleNews";
import React from "react";
import { useState } from "react";
export default function NoAuthExplorePage() {
  const [isOpenNewsModal, setIsOpenNewsModal] = useState(false);

  const defaultPlaceholder = `. Gold market and Impact
. Cease fire between Israel and Hamas
. Human jobs that AI may eliminate`;

  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-[120px]">
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {/* Header Section */}
        <div>
          <p className="items-center text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Explore Path — Your Journey with
            <span className="primary-color font-tamdan-bold">
              {" "}
              TAMDAN
            </span>
          </p>
        </div>

        {/* Description Section */}
        <div className="pt-8 sm:pt-12 md:pt-16">
          <p className="text-sm sm:text-base md:text-lg leading-relaxed font-normal text-[#1A1A1A]">
            <span className="float-left text-5xl sm:text-6xl md:text-7xl font-[TamdanBold] leading-[0.8] mr-2 sm:mr-3 mt-1">
              T
            </span>
            AMDAN is an intelligent AI-powered assistant designed to help you
            explore the world of information effortlessly. Powered by GPT-5 and
            n8n automation, TAMDAN connects to reliable news sources, analyzes
            fresh updates, and delivers the information that truly matters to
            you. Whether you're tracking breaking news, following specific
            topics, or simply staying informed, TAMDAN ensures that everything
            you receive is relevant, timely, and personalized.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="pt-12 sm:pt-16 md:pt-20 space-y-6 sm:space-y-8">
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold">How TAMDAN Works for You</p>
        <p className="text-sm sm:text-base md:text-lg leading-relaxed">
          The Explore Path is where your journey with TAMDAN begins — a guided
          setup that helps the AI understand your preferences and deliver
          updates that fit perfectly into your daily routine.
        </p>

        {/* Step 1 */}
        <div>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            <span className="font-bold">Step 1: Input Your Interests:</span>
            Start by entering the topics or keywords that matter most to you —
            from technology and education to health or global news. This step
            allows TAMDAN to identify your focus areas and curate information that
            aligns with your interests. By sharing your preferences, you help the
            AI eliminate irrelevant noise and ensure that every update adds real
            value.
          </p>
        </div>

        {/* Input Demo */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl">
            <p className="text-xs sm:text-sm md:text-base text-color mb-4 sm:mb-6 text-center">
              _____Write your interests here_____
            </p>
            <form>
              <div className="relative">
                <textarea
                  disabled
                  rows={5}
                  placeholder={defaultPlaceholder}
                  className="w-full h-48 sm:h-56 md:h-64 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-white leading-relaxed"
                />
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4">
                  <button
                    type="submit"
                    disabled
                    className="text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-5 bg-primary-color text-white hover:bg-primary-color disabled:opacity-60 whitespace-nowrap"
                  >
                    Generate your agent
                  </button>
                </div>
              </div>
            </form>
            <p className="text-xs sm:text-sm md:text-base text-color mb-6 text-center mt-2 sm:mt-3">
              ""Find Better. Faster. With TAMDAN.""
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <p className="text-sm sm:text-base md:text-lg leading-relaxed">
          <span className="font-bold">
            Step 2: Choose Your Notification Channel:
          </span>
          Next, select how you'd like to receive your updates. TAMDAN supports
          Telegram chatbot and Gmail, giving you the flexibility to stay
          informed in your preferred way. Telegram offers quick, conversational
          alerts through the chatbot, while Gmail provides a clean and organized
          summary right in your inbox. This choice ensures TAMDAN integrates
          naturally into your lifestyle and communication habits.
        </p>

        {/* Channel Images */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-4 md:gap-6">
          <div className="flex-1 space-y-3 sm:space-y-4">
            <img src="/image/telegramMockUp.png" alt="Telegram Bot" className="w-full h-auto" />
            <p className="text-center text-sm sm:text-base">TELEGRAM CHATBOT</p>
          </div>
          <div className="flex-1 space-y-3 sm:space-y-4">
            <img src="/image/gmailMockUp.png" alt="Gmail Bot" className="w-full h-auto" />
            <p className="text-center text-sm sm:text-base">ALERT BY GMAIL</p>
          </div>
        </div>

        {/* Step 3 */}
        <p className="text-sm sm:text-base md:text-lg leading-relaxed">
          <span className="font-bold">Step 3: Set Your Alert Time:</span>
          Once your channel is selected, choose the time that best fits your
          schedule. TAMDAN sends your personalized updates every 24 hours,
          ensuring you get the latest information at the moment that's most
          convenient for you. This way, you stay informed without being
          overwhelmed — the news comes to you, right when you want it.
        </p>

        {/* Step 4 */}
        <p className="text-sm sm:text-base md:text-lg leading-relaxed">
          <span className="font-bold">Step 4: Let TAMDAN Do the Work: </span>
          After setup, TAMDAN continuously monitors sources, filters out
          unreliable content, and compiles the most relevant updates for you.
          With its AI-powered workflow, it saves you hours of manual searching
          and delivers information that's insightful, trustworthy, and easy to
          digest.
        </p>
      </div>

      {/* PDF Button */}
      <div className="w-full flex justify-center mt-8 sm:mt-10 md:mt-12">
        <button className="bg-white px-6 sm:px-8 py-3 sm:py-4 cursor-pointer text-sm sm:text-base border border-gray-300 hover:bg-gray-50" onClick={()=>setIsOpenNewsModal(true)}>
          SAMPLE NEWS AS .PDF
        </button>
      </div>

      {/* Closing Text */}
      <p className="pt-8 sm:pt-10 md:pt-12 text-sm sm:text-base md:text-lg leading-relaxed mb-12 sm:mb-16">
        In just a few guided steps, TAMDAN transforms the way you discover and receive information — smart, simple, and personalized by AI.
      </p>

      {/* PDF Modal */}
      {isOpenNewsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 px-4" onClick={() => setIsOpenNewsModal(false)}>
          <SampleNews setIsOpenNewsModal={setIsOpenNewsModal} />
        </div>
      )}
    </div>
  );
}
