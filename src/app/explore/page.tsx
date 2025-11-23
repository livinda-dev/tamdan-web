"use client";
import SampleNews from "@/components/sampleNews";
import React from "react";
import { useState } from "react";
export default function ExplorePage() {
  const [isOpenNewsModal, setIsOpenNewsModal] = useState(false);

  const defaultPlaceholder = `. Gold market and Impact
. Cease fire between Israel and Hamas
. Human jobs that AI may eliminate`;

  return (
    <div className="sm:px-[120px] lg:px-[120px] px-[120px]">
      <div>
        <div>
          <p className="items-center text-center text-[36px]">
            Explore Path — Your Journey with
            <span className="primary-color text-[36px] font-tamdan-bold">
              {" "}
              TAMDAN
            </span>
          </p>
        </div>
        <div className="pt-[63px]">
          <p className="text-[18px] leading-relaxed font-normal text-[#1A1A1A]">
            <span className="float-left text-[56px] font-[TamdanBold] leading-[0.8] mr-3 mt-1">
              T
            </span>
            AMDAN is an intelligent AI-powered assistant designed to help you
            explore the world of information effortlessly. Powered by GPT-5 and
            n8n automation, TAMDAN connects to reliable news sources, analyzes
            fresh updates, and delivers the information that truly matters to
            you. Whether you’re tracking breaking news, following specific
            topics, or simply staying informed, TAMDAN ensures that everything
            you receive is relevant, timely, and personalized.
          </p>
        </div>
      </div>
      <div className="pt-[99px] justify-between h-auto space-y-6">
        <p className="text-[36px]">How TAMDAN Works for You</p>
        <p>
          The Explore Path is where your journey with TAMDAN begins — a guided
          setup that helps the AI understand your preferences and deliver
          updates that fit perfectly into your daily routine.
        </p>
        <p className="pl-[93px]">
          <span className=" font-bold">Step 1: Input Your Interests:</span>
          Start by entering the topics or keywords that matter most to you —
          from technology and education to health or global news. This step
          allows TAMDAN to identify your focus areas and curate information that
          aligns with your interests. By sharing your preferences, you help the
          AI eliminate irrelevant noise and ensure that every update adds real
          value.
        </p>
        <div className="w-full justify-items-center">
          <div className="w-[744px]">
            <p className="text-[16px] text-color mb-6 text-center ">
              _____Write your interests here_____
            </p>
            <form>
              <div className="relative">
                <textarea
                  disabled
                  rows={5}
                  placeholder={defaultPlaceholder}
                  
                  className="w-full h-[320px] px-[35px] py-[30px] bg-white leading-8"
                />
                <div className="absolute bottom-4 right-4">
                  <button
                    type="submit"
                    disabled
                    className="w-full md:w-[180px] text-[16px] h-[39px] bg-primary-color text-white px-2 py-2 hover:bg-primary-color disabled:opacity-60"
                  >
                    Generate your agent
                  </button>
                </div>
              </div>
            </form>
            <p className="text-[16px] text-color mb-6 text-center">
              ““Find Better. Faster. With TAMDAN.””
            </p>
          </div>
        </div>
        <p className="pl-[93px]">
          <span className=" font-bold">
            Step 2: Choose Your Notification Channel:
          </span>
          Next, select how you’d like to receive your updates. TAMDAN supports
          Telegram chatbot and Gmail, giving you the flexibility to stay
          informed in your preferred way. Telegram offers quick, conversational
          alerts through the chatbot, while Gmail provides a clean and organized
          summary right in your inbox. This choice ensures TAMDAN integrates
          naturally into your lifestyle and communication habits.
        </p>
        <div className=" justify-between flex space-x-[40px]">
          <div className=" space-y-[12px]">
            <img src="/image/telegramMockUp.png" alt="Telegram Bot" />
            <p className=" text-center">TELEGRAM CHATBOT</p>
          </div>
          <div className=" space-y-[12px]">
            <img src="/image/gmailMockUp.png" alt="Gmail Bot" />
            <p className=" text-center">ALERT BY GMAIL</p>
          </div>
        </div>
        <p className="pl-[93px]">
          <span className=" font-bold">Step 3: Set Your Alert Time:</span>
          Once your channel is selected, choose the time that best fits your
          schedule. TAMDAN sends your personalized updates every 24 hours,
          ensuring you get the latest information at the moment that’s most
          convenient for you. This way, you stay informed without being
          overwhelmed — the news comes to you, right when you want it.
        </p>
        <p className="pl-[93px]">
          <span className=" font-bold">Step 4: Let TAMDAN Do the Work: </span>
          After setup, TAMDAN continuously monitors sources, filters out
          unreliable content, and compiles the most relevant updates for you.
          With its AI-powered workflow, it saves you hours of manual searching
          and delivers information that’s insightful, trustworthy, and easy to
          digest.
        </p>
      </div>
      <div className=" w-full flex justify-center mt-[40px]">
        <button className=" bg-white p-[10px] cursor-pointer" onClick={()=>setIsOpenNewsModal(true)}>SAMPLE NEWS AS .PDF</button>
      </div>

      {isOpenNewsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50" onClick={() => setIsOpenNewsModal(false)}>
          <SampleNews setIsOpenNewsModal={setIsOpenNewsModal} />
        </div>
      )}
      <p className="pt-[49px]">In just a few guided steps, TAMDAN transforms the way you discover and receive information — smart, simple, and personalized by AI.</p>
    </div>
  );
}
